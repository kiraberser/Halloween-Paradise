from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.db import models
from django.utils import timezone


MAX_COMPROBANTE_MB = 10


def validar_tamano(archivo):
    if archivo.size > MAX_COMPROBANTE_MB * 1024 * 1024:
        raise ValidationError(f"El comprobante no puede pesar más de {MAX_COMPROBANTE_MB} MB.")


class MovimientoFinanciero(models.Model):
    """Registro de costos y gastos del evento, clasificados en fijos o variables."""

    class Tipo(models.TextChoices):
        COSTO = "costo", "Costo"
        GASTO = "gasto", "Gasto"

    class Naturaleza(models.TextChoices):
        FIJO = "fijo", "Fijo"
        VARIABLE = "variable", "Variable"

    class Categoria(models.TextChoices):
        RENTA = "renta", "Renta del lugar"
        SONIDO = "sonido", "Sonido / DJ"
        ILUMINACION = "iluminacion", "Iluminación"
        DECORACION = "decoracion", "Decoración"
        BEBIDAS = "bebidas", "Bebidas"
        SEGURIDAD = "seguridad", "Seguridad"
        PUBLICIDAD = "publicidad", "Publicidad"
        STAFF = "staff", "Staff"
        PERMISOS = "permisos", "Permisos"
        OTROS = "otros", "Otros"

    concepto = models.CharField(max_length=150)
    tipo = models.CharField(max_length=5, choices=Tipo.choices)
    naturaleza = models.CharField(max_length=8, choices=Naturaleza.choices)
    categoria = models.CharField("categoría", max_length=12, choices=Categoria.choices, default=Categoria.OTROS)
    monto = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    fecha = models.DateField(default=timezone.localdate)
    proveedor = models.CharField(max_length=150, blank=True)
    comprobante = models.FileField(
        upload_to="comprobantes/", null=True, blank=True,
        # Solo PDF o imágenes (sin SVG/HTML, que pueden llevar scripts) y máximo 10 MB.
        validators=[FileExtensionValidator(["pdf", "jpg", "jpeg", "png", "webp"]), validar_tamano],
    )
    notas = models.TextField(blank=True)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "costo / gasto"
        verbose_name_plural = "costos y gastos"
        ordering = ("-fecha", "-creado")

    def __str__(self):
        return f"{self.get_tipo_display()} {self.get_naturaleza_display().lower()}: {self.concepto} (${self.monto})"
