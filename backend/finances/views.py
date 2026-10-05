from rest_framework import permissions, viewsets

from .models import MovimientoFinanciero
from .serializers import MovimientoFinancieroSerializer


class MovimientoFinancieroViewSet(viewsets.ModelViewSet):
    queryset = MovimientoFinanciero.objects.all()
    serializer_class = MovimientoFinancieroSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = {
        "tipo": ["exact"],
        "naturaleza": ["exact"],
        "categoria": ["exact"],
        "fecha": ["gte", "lte"],
    }
    search_fields = ("concepto", "proveedor", "notas")
    ordering_fields = ("fecha", "monto")
