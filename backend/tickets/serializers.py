from rest_framework import serializers

from .models import TipoBoleto, VentaBoleto


class TipoBoletoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoBoleto
        fields = ("id", "nombre", "descripcion", "precio", "cupo", "activo", "orden")


class VentaBoletoSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tipo_nombre = serializers.CharField(source="tipo.nombre", read_only=True)
    genero_display = serializers.CharField(source="get_genero_display", read_only=True)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)

    class Meta:
        model = VentaBoleto
        fields = (
            "id", "nombre", "tipo", "tipo_nombre", "precio", "cantidad", "total",
            "genero", "genero_display", "usuario", "canal", "estado", "fecha_venta", "notas",
        )
        read_only_fields = ("fecha_venta",)
