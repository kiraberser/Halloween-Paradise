"""Código único por venta (para el folio y el QR del boleto).

Se agrega en tres pasos para que cada venta existente reciba un UUID distinto:
un default en AddField daría el mismo valor a todas las filas y rompería el unique.
"""
import uuid

from django.db import migrations, models


def generar_codigos(apps, schema_editor):
    VentaBoleto = apps.get_model("tickets", "VentaBoleto")
    for venta in VentaBoleto.objects.filter(codigo__isnull=True).only("pk"):
        venta.codigo = uuid.uuid4()
        venta.save(update_fields=["codigo"])


class Migration(migrations.Migration):
    dependencies = [("tickets", "0003_precios_halloween_2026")]

    operations = [
        migrations.AddField(
            model_name="ventaboleto",
            name="codigo",
            field=models.UUIDField(null=True, editable=False, verbose_name="código"),
        ),
        migrations.RunPython(generar_codigos, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="ventaboleto",
            name="codigo",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True, verbose_name="código"),
        ),
    ]
