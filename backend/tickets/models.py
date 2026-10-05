from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from accounts.models import Genero


class TipoBoleto(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField("descripción", max_length=255, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    cupo = models.PositiveIntegerField(null=True, blank=True, help_text="Vacío = sin límite")
    activo = models.BooleanField(default=True)
    orden = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "tipo de boleto"
        verbose_name_plural = "tipos de boleto"
        ordering = ("orden", "precio")

    def __str__(self):
        return f"{self.nombre} (${self.precio})"


class VentaBoleto(models.Model):
    class Canal(models.TextChoices):
        MESSENGER = "messenger", "Messenger"
        INSTAGRAM = "instagram", "Instagram"
        TAQUILLA = "taquilla", "Taquilla"

    class Estado(models.TextChoices):
        PENDIENTE = "pendiente", "Pendiente"
        PAGADO = "pagado", "Pagado"
        CANCELADO = "cancelado", "Cancelado"

    nombre = models.CharField("nombre del comprador", max_length=150)
    tipo = models.ForeignKey(TipoBoleto, on_delete=models.PROTECT, related_name="ventas")
    precio = models.DecimalField(
        "precio unitario", max_digits=10, decimal_places=2, blank=True,
        validators=[MinValueValidator(0)], help_text="Si se deja vacío se toma el precio del tipo.",
    )
    cantidad = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    genero = models.CharField("género", max_length=1, choices=Genero.choices, default=Genero.NO_DICE)
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="compras"
    )
    canal = models.CharField(max_length=12, choices=Canal.choices, default=Canal.MESSENGER)
    estado = models.CharField(max_length=10, choices=Estado.choices, default=Estado.PAGADO)
    fecha_venta = models.DateTimeField("fecha de venta", auto_now_add=True)
    notas = models.TextField(blank=True)

    class Meta:
        verbose_name = "venta de boleto"
        verbose_name_plural = "ventas de boletos"
        ordering = ("-fecha_venta",)

    def __str__(self):
        return f"{self.nombre} — {self.cantidad} × {self.tipo.nombre}"

    @property
    def total(self):
        return (self.precio or 0) * self.cantidad

    def save(self, *args, **kwargs):
        if self.precio is None:
            self.precio = self.tipo.precio
        super().save(*args, **kwargs)
