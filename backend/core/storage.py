"""Almacenamiento de archivos subidos (fotos de perfil, comprobantes) en Cloudinary.

El nombre guardado en la BD tiene la forma ``<resource_type>/<public_id>[.<formato>]``,
p. ej. ``image/halloween-paradise/perfiles/ana-3f9c1a.jpg``, para poder construir la URL
y borrar el archivo sin consultar la API de Cloudinary.
"""
import os
import uuid
from urllib.request import urlopen

import cloudinary
import cloudinary.uploader
import cloudinary.utils
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from django.utils.text import slugify


@deconstructible
class CloudinaryMediaStorage(Storage):
    def __init__(self, folder=None):
        self.folder = folder or getattr(settings, "CLOUDINARY_FOLDER", "halloween-paradise")

    # --- helpers ---------------------------------------------------------
    @staticmethod
    def _split(name):
        resource_type, rest = name.split("/", 1) if "/" in name else ("image", name)
        if resource_type == "raw":  # los raw conservan la extensión en el public_id
            return resource_type, rest, None
        public_id, ext = os.path.splitext(rest)
        return resource_type, public_id, ext.lstrip(".") or None

    def _public_id(self, name):
        base, _ = os.path.splitext(name)
        directory, filename = os.path.split(base)
        # Sufijo aleatorio: cada versión tiene URL nueva y no hay caché CDN obsoleta.
        filename = f"{slugify(filename)[:40] or 'archivo'}-{uuid.uuid4().hex[:6]}"
        return "/".join(p for p in (self.folder, directory, filename) if p)

    # --- API de Storage -----------------------------------------------------
    def _save(self, name, content):
        content.seek(0)
        result = cloudinary.uploader.upload(
            content,
            public_id=self._public_id(name),
            resource_type="auto",
            overwrite=False,
        )
        stored = f"{result['resource_type']}/{result['public_id']}"
        if result.get("format") and result["resource_type"] != "raw":
            stored += f".{result['format']}"
        return stored

    def _open(self, name, mode="rb"):
        with urlopen(self.url(name)) as resp:  # noqa: S310 - URL de Cloudinary construida por nosotros
            file = ContentFile(resp.read())
        file.name = name
        return file

    def url(self, name, **options):
        resource_type, public_id, fmt = self._split(name)
        return cloudinary.utils.cloudinary_url(
            public_id, resource_type=resource_type, format=fmt, secure=True, **options
        )[0]

    def delete(self, name):
        if not name:
            return
        resource_type, public_id, _ = self._split(name)
        cloudinary.uploader.destroy(public_id, resource_type=resource_type, invalidate=True)

    def exists(self, name):
        # Los public_id llevan sufijo aleatorio, así que nunca hay colisiones.
        return False

    def get_available_name(self, name, max_length=None):
        return name

    def size(self, name):
        return 0

    def listdir(self, path):
        raise NotImplementedError("listdir no está soportado en Cloudinary.")


def image_url(field_file, **transformations):
    """URL de una imagen; con Cloudinary aplica transformaciones (recorte, calidad…)."""
    if not field_file:
        return None
    storage = field_file.storage
    if isinstance(storage, CloudinaryMediaStorage):
        return storage.url(field_file.name, **transformations)
    return field_file.url
