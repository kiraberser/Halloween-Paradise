from rest_framework import serializers

from .models import MovimientoFinanciero


class MovimientoFinancieroSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source="get_tipo_display", read_only=True)
    naturaleza_display = serializers.CharField(source="get_naturaleza_display", read_only=True)
    categoria_display = serializers.CharField(source="get_categoria_display", read_only=True)

    class Meta:
        model = MovimientoFinanciero
        fields = (
            "id", "concepto", "tipo", "tipo_display", "naturaleza", "naturaleza_display",
            "categoria", "categoria_display", "monto", "fecha", "proveedor", "comprobante", "notas", "creado",
        )
        read_only_fields = ("creado",)
