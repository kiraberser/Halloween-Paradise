"""Precios definitivos del evento. Desactiva (sin borrar) los tipos de boleto anteriores."""
from decimal import Decimal

from django.db import migrations

# nombre, descripción, precio, aplica a, modalidad
TIPOS = [
    ("Mujer disfrazada · antes de 11 PM", "Entrada gratis + drink de bienvenida con vaso", "0", "M", "gratis"),
    ("Mujer disfrazada · después de 11 PM", "Entrada gratis", "0", "M", "gratis"),
    ("Mujer sin disfraz", "A cualquier hora", "80", "M", "puerta"),
    ("Hombre · preventa", "Compra antes de la fiesta, con o sin disfraz", "70", "H", "preventa"),
    ("Hombre disfrazado · en puerta", "Sin preventa", "90", "H", "puerta"),
    ("Hombre sin disfraz · en puerta", "Sin preventa", "120", "H", "puerta"),
]
ANTERIORES = ["Preventa", "General", "VIP"]


def crear_tipos(apps, schema_editor):
    TipoBoleto = apps.get_model("tickets", "TipoBoleto")
    TipoBoleto.objects.filter(nombre__in=ANTERIORES).update(activo=False)
    for orden, (nombre, descripcion, precio, genero, modalidad) in enumerate(TIPOS, start=1):
        TipoBoleto.objects.update_or_create(
            nombre=nombre,
            defaults={
                "descripcion": descripcion, "precio": Decimal(precio), "genero": genero,
                "modalidad": modalidad, "activo": True, "orden": orden,
            },
        )


def revertir(apps, schema_editor):
    TipoBoleto = apps.get_model("tickets", "TipoBoleto")
    TipoBoleto.objects.filter(nombre__in=[t[0] for t in TIPOS], ventas__isnull=True).delete()
    TipoBoleto.objects.filter(nombre__in=[t[0] for t in TIPOS]).update(activo=False)
    TipoBoleto.objects.filter(nombre__in=ANTERIORES).update(activo=True)


class Migration(migrations.Migration):
    dependencies = [("tickets", "0002_tipo_genero_modalidad")]

    operations = [migrations.RunPython(crear_tipos, revertir)]
