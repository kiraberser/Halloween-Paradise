from django.test import TestCase

from accounts.models import User
from finances.models import MovimientoFinanciero
from tickets.models import TipoBoleto, VentaBoleto


class RolesTests(TestCase):
    """Admin (superuser) vs staff: el staff ve todo pero no borra ni da permisos."""

    def setUp(self):
        self.admin = User.objects.create_superuser("admin", "admin@hp.mx", "x")
        self.socio = User.objects.create_user("socio@hp.mx", "socio@hp.mx", "x", first_name="Socio", is_staff=True)
        self.ana = User.objects.create_user("ana@hp.mx", "ana@hp.mx", "x", first_name="Ana")
        tipo = TipoBoleto.objects.get(nombre="Mujer sin disfraz")
        self.venta = VentaBoleto.objects.create(nombre="Ana", tipo=tipo)
        self.gasto = MovimientoFinanciero.objects.create(concepto="Renta", tipo="costo", naturaleza="fijo", monto=100)

    def test_staff_ve_dashboard_y_edita_pero_no_borra(self):
        self.client.force_login(self.socio)
        for url in ["/api/dashboard/kpis/", "/api/users/", "/api/sales/", "/api/expenses/"]:
            self.assertEqual(self.client.get(url).status_code, 200, url)
        cambio = self.client.patch(f"/api/sales/{self.venta.id}/", {"estado": "pendiente"}, content_type="application/json")
        self.assertEqual(cambio.status_code, 200)
        self.assertEqual(self.client.delete(f"/api/sales/{self.venta.id}/").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/expenses/{self.gasto.id}/").status_code, 403)
        self.assertTrue(VentaBoleto.objects.filter(pk=self.venta.pk).exists())

    def test_admin_borra(self):
        self.client.force_login(self.admin)
        self.assertEqual(self.client.delete(f"/api/sales/{self.venta.id}/").status_code, 204)
        self.assertEqual(self.client.delete(f"/api/expenses/{self.gasto.id}/").status_code, 204)

    def test_admin_da_y_quita_staff(self):
        self.client.force_login(self.admin)
        url = f"/api/users/{self.ana.id}/staff/"
        dar = self.client.post(url, {"is_staff": True}, content_type="application/json")
        self.assertEqual(dar.status_code, 200)
        self.assertTrue(dar.json()["is_staff"])
        self.assertFalse(dar.json()["is_superuser"])
        quitar = self.client.post(url, {"is_staff": False}, content_type="application/json")
        self.assertFalse(quitar.json()["is_staff"])

    def test_staff_no_puede_dar_permisos(self):
        self.client.force_login(self.socio)
        resp = self.client.post(f"/api/users/{self.ana.id}/staff/", {"is_staff": True}, content_type="application/json")
        self.assertEqual(resp.status_code, 403)
        self.ana.refresh_from_db()
        self.assertFalse(self.ana.is_staff)

    def test_admin_no_se_quita_permisos_a_si_mismo(self):
        self.client.force_login(self.admin)
        resp = self.client.post(f"/api/users/{self.admin.id}/staff/", {"is_staff": False}, content_type="application/json")
        self.assertEqual(resp.status_code, 400)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.is_staff)

    def test_filtro_staff_en_lista(self):
        self.client.force_login(self.admin)
        nombres = {u["first_name"] for u in self.client.get("/api/users/?rol=staff").json()["results"]}
        self.assertEqual(nombres, {"Socio", ""})  # "" = admin sin nombre
