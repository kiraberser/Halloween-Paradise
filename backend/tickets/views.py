from rest_framework import permissions, viewsets

from core.permissions import IsStaffOrReadOnly

from .models import TipoBoleto, VentaBoleto
from .serializers import TipoBoletoSerializer, VentaBoletoSerializer


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
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = {
        "estado": ["exact"],
        "tipo": ["exact"],
        "canal": ["exact"],
        "genero": ["exact"],
        "fecha_venta": ["date__gte", "date__lte"],
    }
    search_fields = ("nombre", "notas")
    ordering_fields = ("fecha_venta", "cantidad", "precio")
