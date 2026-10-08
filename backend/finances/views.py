from rest_framework import viewsets

from core.permissions import IsStaffNoDelete
from core.seguridad import evento

from .models import MovimientoFinanciero
from .serializers import MovimientoFinancieroSerializer


class MovimientoFinancieroViewSet(viewsets.ModelViewSet):
    queryset = MovimientoFinanciero.objects.all()
    serializer_class = MovimientoFinancieroSerializer
    permission_classes = [IsStaffNoDelete]
    filterset_fields = {
        "tipo": ["exact"],
        "naturaleza": ["exact"],
        "categoria": ["exact"],
        "fecha": ["gte", "lte"],
    }
    search_fields = ("concepto", "proveedor", "notas")
    ordering_fields = ("fecha", "monto")

    def perform_destroy(self, instance):
        evento("gasto_borrado", self.request, concepto=instance.concepto, monto=instance.monto)
        instance.delete()
