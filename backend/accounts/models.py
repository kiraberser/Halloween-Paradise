from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models
from django.utils.text import slugify


class Genero(models.TextChoices):
    HOMBRE = "H", "Hombre"
    MUJER = "M", "Mujer"
    OTRO = "O", "Otro"
    NO_DICE = "N", "Prefiero no decir"


MAX_FOTO_MB = 5


def validar_tamano_foto(archivo):
    if archivo.size > MAX_FOTO_MB * 1024 * 1024:
        raise ValidationError(f"La foto no puede pesar más de {MAX_FOTO_MB} MB.")


def ruta_foto_perfil(instance, filename):
    ext = filename.rsplit(".", 1)[-1].lower()
    return f"perfiles/{slugify(instance.username)}.{ext}"


class User(AbstractUser):
    email = models.EmailField("correo electrónico", unique=True)
    telefono = models.CharField("teléfono", max_length=20, blank=True)
    genero = models.CharField("género", max_length=1, choices=Genero.choices, default=Genero.NO_DICE)
    fecha_nacimiento = models.DateField("fecha de nacimiento", null=True, blank=True)
    foto_perfil = models.ImageField(
        "foto de perfil",
        upload_to=ruta_foto_perfil,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(["jpg", "jpeg", "png", "webp"]),
            validar_tamano_foto,
        ],
        help_text="Se imprimirá para la ofrenda de Día de Muertos.",
    )

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self):
        return self.get_full_name() or self.username

    def save(self, *args, **kwargs):
        # Al reemplazar la foto, borra la anterior del almacenamiento (Cloudinary o disco).
        anterior = None
        if self.pk:
            anterior = User.objects.filter(pk=self.pk).values_list("foto_perfil", flat=True).first()
        super().save(*args, **kwargs)
        if anterior and anterior != self.foto_perfil.name:
            self.foto_perfil.storage.delete(anterior)
