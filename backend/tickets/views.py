import uuid

from django.db import transaction
from django.db.models import CharField
from django.db.models.functions import Cast
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from core.permissions import IsStaffNoDelete, IsStaffOrReadOnly
from core.seguridad import evento

from .models import TipoBoleto, VentaBoleto
from .serializers import EntradaSerializer, TipoBoletoSerializer, VentaBoletoSerializer


class TipoBoletoViewSet(viewsets.ModelViewSet):
    serializer_class = TipoBoletoSerializer
    permission_classes = [IsStaffOrReadOnly]
    pagination_class = None

    def get_queryset(self):
        qs = TipoBoleto.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(activo=True)
        return qs


class VentaBoletoViewSet(viewsets.ModelViewSet):
    queryset = VentaBoleto.objects.select_related("tipo")
    serializer_class = VentaBoletoSerializer
    permission_classes = [IsStaffNoDelete]
    filterset_fields = {
        "estado": ["exact"],
        "tipo": ["exact"],
        "canal": ["exact"],
        "genero": ["exact"],
        "fecha_venta": ["date__gte", "date__lte"],
    }
    search_fields = ("nombre", "notas")
    ordering_fields = ("fecha_venta", "cantidad", "precio")

    def perform_destroy(self, instance):
        evento("venta_borrada", self.request, folio=instance.folio, nombre=instance.nombre, total=instance.total)
        instance.delete()

    @action(detail=False, methods=["get"])
    def lookup(self, request):
        """Busca un boleto por el contenido del QR (UUID completo) o por su folio HP-XXXXXXXX."""
        valor = request.query_params.get("codigo", "").strip()
        qs = VentaBoleto.objects.select_related("tipo", "usuario", "ingreso_por")
        try:
            ventas = list(qs.filter(codigo=uuid.UUID(valor.rsplit(":", 1)[-1])))
        except ValueError:
            folio = valor.upper().removeprefix("HP-").lower()
            if len(folio) != 8 or any(c not in "0123456789abcdef" for c in folio):
                return Response({"detail": "Código no válido."}, status=status.HTTP_400_BAD_REQUEST)
            ventas = list(qs.annotate(cod=Cast("codigo", CharField())).filter(cod__startswith=folio)[:2])
        if not ventas:
            return Response({"detail": "Boleto no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        if len(ventas) > 1:
            return Response({"detail": "Folio ambiguo; escanea el QR."}, status=status.HTTP_409_CONFLICT)
        return Response(EntradaSerializer(ventas[0], context={"request": request}).data)

    @action(detail=True, methods=["post", "delete"])
    def checkin(self, request, pk=None):
        """POST marca la entrada (con ``cobrar: true`` cobra un boleto pendiente). DELETE la deshace."""
        with transaction.atomic():
            venta = VentaBoleto.objects.select_for_update().get(pk=self.get_object().pk)
            if request.method == "DELETE":
                venta.ingreso = None
                venta.ingreso_por = None
                venta.save(update_fields=["ingreso", "ingreso_por"])
                evento("entrada_deshecha", request, folio=venta.folio)
            else:
                error = None
                if venta.estado == VentaBoleto.Estado.CANCELADO:
                    error = (status.HTTP_400_BAD_REQUEST, "Este boleto está cancelado.")
                elif venta.ingreso:
                    hora = timezone.localtime(venta.ingreso).strftime("%I:%M %p")
                    error = (status.HTTP_409_CONFLICT, f"Este boleto ya se usó a las {hora}.")
                elif venta.estado == VentaBoleto.Estado.PENDIENTE and not request.data.get("cobrar"):
                    error = (status.HTTP_400_BAD_REQUEST, "Boleto pendiente de pago.")
                if error:
                    return Response({"detail": error[1]}, status=error[0])
                venta.estado = VentaBoleto.Estado.PAGADO
                venta.ingreso = timezone.now()
                venta.ingreso_por = request.user
                venta.save(update_fields=["estado", "ingreso", "ingreso_por"])
                evento("entrada_marcada", request, folio=venta.folio, cobrado=bool(request.data.get("cobrar")))
        venta = VentaBoleto.objects.select_related("tipo", "usuario", "ingreso_por").get(pk=venta.pk)
        return Response(EntradaSerializer(venta, context={"request": request}).data)
