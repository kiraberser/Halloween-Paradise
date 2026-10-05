import shutil
import tempfile
from decimal import Decimal
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from accounts.models import User
from finances.models import MovimientoFinanciero
from tickets.models import TipoBoleto, VentaBoleto

MEDIA_TMP = tempfile.mkdtemp()


def imagen_png():
    buf = BytesIO()
    Image.new("RGB", (10, 10), "orange").save(buf, "PNG")
    return SimpleUploadedFile("foto.png", buf.getvalue(), content_type="image/png")


class DashboardTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("admin", "admin@paradise.mx", "pass12345")
        self.user = User.objects.create_user("u@x.com", "u@x.com", "pass12345", genero="M")
        general = TipoBoleto.objects.create(nombre="General", precio=Decimal("350"))
        VentaBoleto.objects.create(nombre="A", tipo=general, cantidad=2, genero="M")
        VentaBoleto.objects.create(nombre="B", tipo=general, cantidad=1, precio=Decimal("300"), genero="H")
        VentaBoleto.objects.create(nombre="C", tipo=general, cantidad=5, estado=VentaBoleto.Estado.CANCELADO)
        MovimientoFinanciero.objects.create(concepto="Renta", tipo="costo", naturaleza="fijo", monto=500)
        MovimientoFinanciero.objects.create(concepto="Publicidad", tipo="gasto", naturaleza="variable", monto=100)

    def test_kpis_solo_cuentan_ventas_pagadas(self):
        self.client.force_authenticate(self.admin)
        data = self.client.get("/api/dashboard/kpis/").json()
        self.assertEqual(data["boletos_vendidos"], 3)
        self.assertEqual(Decimal(data["ingresos"]), Decimal("1000"))
        self.assertEqual(Decimal(data["costos"]), Decimal("500"))
        self.assertEqual(Decimal(data["gastos"]), Decimal("100"))
        self.assertEqual(Decimal(data["utilidad"]), Decimal("400"))
        self.assertEqual(data["usuarios_registrados"], 1)

    def test_precio_se_toma_del_tipo(self):
        self.assertEqual(VentaBoleto.objects.get(nombre="A").total, Decimal("700"))

    def test_endpoints_dashboard_requieren_staff(self):
        rutas = ["kpis", "demographics", "timeline", "sales-breakdown", "expenses-breakdown"]
        for ruta in rutas:
            self.assertEqual(self.client.get(f"/api/dashboard/{ruta}/").status_code, 401)
        self.client.force_authenticate(self.user)
        for ruta in rutas:
            self.assertEqual(self.client.get(f"/api/dashboard/{ruta}/").status_code, 403)
        self.assertEqual(self.client.get("/api/sales/").status_code, 403)
        self.assertEqual(self.client.get("/api/expenses/").status_code, 403)
        self.client.force_authenticate(self.admin)
        for ruta in rutas:
            self.assertEqual(self.client.get(f"/api/dashboard/{ruta}/").status_code, 200)

    def test_tipos_de_boleto_publicos_solo_lectura(self):
        self.assertEqual(self.client.get("/api/ticket-types/").status_code, 200)
        resp = self.client.post("/api/ticket-types/", {"nombre": "X", "precio": "1"})
        self.assertEqual(resp.status_code, 401)


@override_settings(MEDIA_ROOT=MEDIA_TMP)
class RegistroTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(MEDIA_TMP, ignore_errors=True)

    def test_registro_con_foto_y_login_por_correo(self):
        resp = self.client.post("/api/auth/register/", {
            "email": "Calaca@Paradise.mx", "password": "Halloween2026!", "first_name": "Cata",
            "last_name": "Rina", "genero": "M", "fecha_nacimiento": "2000-11-02", "foto_perfil": imagen_png(),
        }, format="multipart")
        self.assertEqual(resp.status_code, 201, resp.content)
        user = User.objects.get(email="calaca@paradise.mx")
        self.assertTrue(user.foto_perfil.name.startswith("perfiles/"))

        tokens = self.client.post("/api/auth/token/", {"username": "calaca@paradise.mx", "password": "Halloween2026!"})
        self.assertEqual(tokens.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens.json()['access']}")
        me = self.client.get("/api/auth/me/").json()
        self.assertEqual(me["first_name"], "Cata")
        self.assertFalse(me["is_staff"])

    def test_correo_duplicado(self):
        User.objects.create_user("a@a.com", "a@a.com", "x")
        resp = self.client.post("/api/auth/register/", {
            "email": "a@a.com", "password": "Halloween2026!", "first_name": "A", "last_name": "B",
        })
        self.assertEqual(resp.status_code, 400)
