from unittest import mock

from django.core.files.base import ContentFile
from django.test import TestCase

from accounts.models import User
from core.storage import CloudinaryMediaStorage, image_url


def respuesta_upload(public_id, **kwargs):
    return {"public_id": public_id, "resource_type": "image", "format": "jpg", "version": 1}


class CloudinaryStorageTests(TestCase):
    def setUp(self):
        self.storage = CloudinaryMediaStorage(folder="hp-test")

    @mock.patch("cloudinary.uploader.upload", side_effect=lambda f, **kw: respuesta_upload(kw["public_id"]))
    def test_save_devuelve_nombre_con_tipo_y_formato(self, upload):
        name = self.storage.save("perfiles/Ana López.png", ContentFile(b"x"))
        self.assertRegex(name, r"^image/hp-test/perfiles/ana-lopez-[0-9a-f]{6}\.jpg$")
        self.assertEqual(upload.call_args.kwargs["resource_type"], "auto")

    def test_url_publica_https(self):
        with mock.patch("cloudinary.utils.cloudinary_url", return_value=("https://res.cloudinary.com/x", {})) as cu:
            self.storage.url("image/hp-test/perfiles/ana-abc123.jpg")
        cu.assert_called_once_with(
            "hp-test/perfiles/ana-abc123", resource_type="image", format="jpg", secure=True
        )

    @mock.patch("cloudinary.uploader.destroy")
    def test_delete_usa_public_id(self, destroy):
        self.storage.delete("raw/hp-test/comprobantes/factura.pdf-abc123")
        destroy.assert_called_once_with("hp-test/comprobantes/factura.pdf-abc123", resource_type="raw", invalidate=True)

    def test_image_url_aplica_transformaciones(self):
        user = User(username="a")
        user.foto_perfil.storage = self.storage
        user.foto_perfil.name = "image/hp-test/perfiles/a-abc123.jpg"
        with mock.patch("cloudinary.utils.cloudinary_url", return_value=("https://cdn/x", {})) as cu:
            self.assertEqual(image_url(user.foto_perfil, crop="fill", gravity="face"), "https://cdn/x")
        self.assertEqual(cu.call_args.kwargs["gravity"], "face")


class FotoAnteriorTests(TestCase):
    def test_reemplazar_foto_borra_la_anterior(self):
        user = User.objects.create_user("b@b.com", "b@b.com", "x")
        User.objects.filter(pk=user.pk).update(foto_perfil="perfiles/vieja.jpg")
        user.refresh_from_db()
        with mock.patch.object(user.foto_perfil.storage, "delete") as delete:
            user.foto_perfil.name = "perfiles/nueva.jpg"
            user.save()
        delete.assert_called_once_with("perfiles/vieja.jpg")


class HealthTests(TestCase):
    def test_health(self):
        self.assertEqual(self.client.get("/api/health/").json(), {"status": "ok"})
