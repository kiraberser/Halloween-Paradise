from django.contrib import admin

from .models import TipoBoleto, VentaBoleto


@admin.register(TipoBoleto)
class TipoBoletoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio", "cupo", "activo", "orden")
    list_editable = ("precio", "activo", "orden")


@admin.register(VentaBoleto)
class VentaBoletoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "tipo", "precio", "cantidad", "total", "genero", "canal", "estado", "fecha_venta")
    list_filter = ("estado", "tipo", "canal", "genero", "fecha_venta")
    search_fields = ("nombre", "notas", "usuario__email")
    autocomplete_fields = ("usuario",)
    date_hierarchy = "fecha_venta"
