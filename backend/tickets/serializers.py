from rest_framework import serializers

from .models import TipoBoleto, VentaBoleto


class TipoBoletoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoBoleto
        fields = ("id", "nombre", "descripcion", "precio", "genero", "modalidad", "cupo", "activo", "orden")


class BoletoSerializer(serializers.ModelSerializer):
    """Boleto tal como lo ve su dueño (o el staff en la lista de usuarios)."""

    tipo_nombre = serializers.CharField(source="tipo.nombre", read_only=True)
    estado_display = serializers.CharField(source="get_estado_display", read_only=True)

    class Meta:
        model = VentaBoleto
        fields = ("id", "folio", "codigo", "tipo_nombre", "precio", "estado", "estado_display", "canal", "fecha_venta")
        read_only_fields = fields


def boleto_activo(ventas):
    """El boleto vigente de un usuario: el pagado más reciente, o si no, el pendiente más reciente."""
    vigentes = [v for v in ventas if v.estado != VentaBoleto.Estado.CANCELADO]
    pagados = [v for v in vigentes if v.estado == VentaBoleto.Estado.PAGADO]
    candidatos = sorted(pagados or vigentes, key=lambda v: v.fecha_venta, reverse=True)
    return candidatos[0] if candidatos else None


class VentaBoletoSerializer(serializers.ModelSerializer):
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tipo_nombre = serializers.CharField(source="tipo.nombre", read_only=True)
    genero_display = serializers.CharField(source="get_genero_display", read_only=True)
    precio = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=0)

    class Meta:
        model = VentaBoleto
        fields = (
            "id", "folio", "nombre", "tipo", "tipo_nombre", "precio", "cantidad", "total",
            "genero", "genero_display", "usuario", "canal", "estado", "fecha_venta", "notas",
        )
        read_only_fields = ("fecha_venta",)

    def validate(self, attrs):
        usuario = attrs.get("usuario")
        if usuario and self.instance is None:
            actual = boleto_activo(usuario.compras.all())
            if actual:
                raise serializers.ValidationError({"usuario": f"Este usuario ya tiene el boleto {actual.folio}."})
        return attrs
