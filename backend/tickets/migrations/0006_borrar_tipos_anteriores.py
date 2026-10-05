"""Borra los tipos de boleto de la versión anterior (Preventa, General, VIP) si no tienen ventas.

Si alguno ya tiene ventas registradas se conserva desactivado para no perder el historial.
"""
from django.db import migrations

ANTERIORES = ["Preventa", "General", "VIP"]


def borrar(apps, schema_editor):
    TipoBoleto = apps.get_model("tickets", "TipoBoleto")
    TipoBoleto.objects.filter(nombre__in=ANTERIORES, ventas__isnull=True).delete()


class Migration(migrations.Migration):
    dependencies = [("tickets", "0005_venta_ingreso")]

    operations = [migrations.RunPython(borrar, migrations.RunPython.noop)]
