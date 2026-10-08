"""Pruebas de las protecciones de seguridad del backend."""
from unittest import mock

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.throttling import ScopedRateThrottle

from accounts.models import User

PASSWORD = "Calabaza-Segura-2026"


class LimitesDePeticionesTests(TestCase):
    def test_login_se_bloquea_tras_muchos_intentos(self):
        User.objects.create_user("ana@hp.mx", "ana@hp.mx", PASSWORD)
        codigos = [
            self.client.post("/api/auth/token/", {"username": "ana@hp.mx", "password": "mala"}).status_code
            for _ in range(16)
        ]
        self.assertEqual(codigos[:15], [401] * 15)
        self.assertEqual(codigos[15], 429)  # el intento 16 en un minuto se rechaza

    def test_registro_tiene_limite(self):
        with mock.patch.dict(ScopedRateThrottle.THROTTLE_RATES, {"registro": "2/hour"}):
            codigos = [
                self.client.post("/api/auth/register/", {
                    "email": f"u{i}@hp.mx", "password": PASSWORD, "first_name": "U", "last_name": "X",
                }).status_code
                for i in range(3)
            ]
        self.assertEqual(codigos, [201, 201, 429])


class TokensTests(TestCase):
    def setUp(self):
        User.objects.create_user("ana@hp.mx", "ana@hp.mx", PASSWORD)
        self.tokens = self.client.post("/api/auth/token/", {"username": "ana@hp.mx", "password": PASSWORD}).json()

    def test_refresh_rota_y_el_viejo_ya_no_sirve(self):
        nuevo = self.client.post("/api/auth/token/refresh/", {"refresh": self.tokens["refresh"]})
        self.assertEqual(nuevo.status_code, 200)
        self.assertNotEqual(nuevo.json()["refresh"], self.tokens["refresh"])
        reuso = self.client.post("/api/auth/token/refresh/", {"refresh": self.tokens["refresh"]})
        self.assertEqual(reuso.status_code, 401)

    def test_logout_revoca_el_refresh(self):
        self.assertEqual(self.client.post("/api/auth/logout/", {"refresh": self.tokens["refresh"]}).status_code, 200)
        self.assertEqual(self.client.post("/api/auth/token/refresh/", {"refresh": self.tokens["refresh"]}).status_code, 401)


class PerfilTests(TestCase):
    def test_no_se_puede_cambiar_el_correo_ni_hacerse_staff(self):
        user = User.objects.create_user("ana@hp.mx", "ana@hp.mx", PASSWORD, first_name="Ana")
        self.client.force_login(user)
        resp = self.client.patch(
            "/api/auth/me/", {"email": "otro@hp.mx", "is_staff": True, "first_name": "Anita"},
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        user.refresh_from_db()
        self.assertEqual((user.email, user.is_staff, user.first_name), ("ana@hp.mx", False, "Anita"))


class ComprobantesTests(TestCase):
    def setUp(self):
        self.client.force_login(User.objects.create_superuser("admin", "admin@hp.mx", PASSWORD))

    def _gasto(self, archivo):
        return self.client.post("/api/expenses/", {
            "concepto": "Renta", "tipo": "costo", "naturaleza": "fijo", "monto": "100", "comprobante": archivo,
        })

    def test_rechaza_svg(self):
        svg = SimpleUploadedFile("factura.svg", b"<svg onload='alert(1)'/>", content_type="image/svg+xml")
        resp = self._gasto(svg)
        self.assertEqual(resp.status_code, 400)
        self.assertIn("comprobante", resp.json())

    @override_settings(STORAGES={
        "default": {"BACKEND": "django.core.files.storage.InMemoryStorage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    })
    def test_acepta_pdf(self):
        pdf = SimpleUploadedFile("factura.pdf", b"%PDF-1.4 prueba", content_type="application/pdf")
        self.assertEqual(self._gasto(pdf).status_code, 201)


class DocumentacionTests(TestCase):
    @override_settings(API_DOCS_PUBLIC=False)
    def test_docs_solo_para_staff_en_produccion(self):
        self.assertIn(self.client.get("/api/schema/").status_code, (401, 403))
        self.client.force_login(User.objects.create_user("staff@hp.mx", "staff@hp.mx", PASSWORD, is_staff=True))
        self.assertEqual(self.client.get("/api/schema/").status_code, 200)


class RegistroDeEventosTests(TestCase):
    def test_login_fallido_se_registra_sin_inyeccion(self):
        with self.assertLogs("paradise.seguridad", level="WARNING") as logs:
            self.client.post("/api/auth/token/", {"username": "falso\nINFO admin_ok", "password": "x"})
        self.assertEqual(len(logs.output), 1)
        self.assertIn("login_fallido", logs.output[0])
        self.assertNotIn("\n", logs.output[0])  # el salto de línea del atacante se neutraliza

    def test_cambio_de_staff_queda_registrado(self):
        admin = User.objects.create_superuser("admin", "admin@hp.mx", PASSWORD)
        socio = User.objects.create_user("socio@hp.mx", "socio@hp.mx", PASSWORD)
        self.client.force_login(admin)
        with self.assertLogs("paradise.seguridad", level="INFO") as logs:
            self.client.post(f"/api/users/{socio.id}/staff/", {"is_staff": True}, content_type="application/json")
        self.assertTrue(any("staff_cambiado" in linea and "socio@hp.mx" in linea for linea in logs.output))
