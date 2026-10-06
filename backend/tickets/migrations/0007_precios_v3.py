"""Precios v3: preventa para mujeres y nuevos precios de hombres.

- Hombres: se actualizan los mismos tipos (las ventas ya registradas conservan su precio).
- Mujeres: se crean tres tipos nuevos (preventa, puerta antes/después de las 11 PM); los tipos
  "disfrazada/gratis" anteriores se borran si no tienen ventas o se desactivan si las tienen.
"""
from decimal import Decimal

from django.db import migrations

# nombre, descripción, precio, aplica a, modalidad, orden
MUJERES = [
    ("Mujer · preventa", "Compra antes de la fiesta", "50", "M", "preventa", 1),
    ("Mujer · en puerta antes de 11 PM", "Sin preventa · incluye drink de bienvenida", "80", "M", "puerta", 2),
    ("Mujer · general (después de 11 PM)", "Sin preventa", "100", "M", "puerta", 3),
]
HOMBRES = {
    "Hombre · preventa": ("Compra antes de la fiesta, con o sin disfraz", "80", 4),
    "Hombre disfrazado · en puerta": ("Sin preventa", "100", 5),
    "Hombre sin disfraz · en puerta": ("Sin preventa", "150", 6),
}
MUJERES_ANTERIORES = ["Mujer disfrazada · antes de 11 PM", "Mujer disfrazada · después de 11 PM", "Mujer sin disfraz"]


def aplicar(apps, schema_editor):
    TipoBoleto = apps.get_model("tickets", "TipoBoleto")
    for nombre, (descripcion, precio, orden) in HOMBRES.items():
        TipoBoleto.objects.update_or_create(
            nombre=nombre,
            defaults={"descripcion": descripcion, "precio": Decimal(precio), "genero": "H",
                      "modalidad": "preventa" if "preventa" in nombre else "puerta", "activo": True, "orden": orden},
        )
    for nombre, descripcion, precio, genero, modalidad, orden in MUJERES:
        TipoBoleto.objects.update_or_create(
            nombre=nombre,
            defaults={"descripcion": descripcion, "precio": Decimal(precio), "genero": genero,
                      "modalidad": modalidad, "activo": True, "orden": orden},
        )
    anteriores = TipoBoleto.objects.filter(nombre__in=MUJERES_ANTERIORES)
    anteriores.filter(ventas__isnull=True).delete()
    anteriores.update(activo=False)


class Migration(migrations.Migration):
    dependencies = [("tickets", "0006_borrar_tipos_anteriores")]

    operations = [migrations.RunPython(aplicar, migrations.RunPython.noop)]
