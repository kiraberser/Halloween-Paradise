from django.contrib import admin

from .models import MovimientoFinanciero


@admin.register(MovimientoFinanciero)
class MovimientoFinancieroAdmin(admin.ModelAdmin):
    list_display = ("concepto", "tipo", "naturaleza", "categoria", "monto", "fecha", "proveedor")
    list_filter = ("tipo", "naturaleza", "categoria", "fecha")
    search_fields = ("concepto", "proveedor", "notas")
    date_hierarchy = "fecha"
