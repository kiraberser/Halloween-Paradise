from django.test import TestCase

from tickets.models import TipoBoleto, VentaBoleto


class PreciosHalloweenTests(TestCase):
    """La migración 0003 deja activos solo los 6 tipos del evento."""

    def test_tipos_activos_y_precios(self):
        activos = {t.nombre: (int(t.precio), t.genero, t.modalidad) for t in TipoBoleto.objects.filter(activo=True)}
        self.assertEqual(activos, {
            "Mujer disfrazada · antes de 11 PM": (0, "M", "gratis"),
            "Mujer disfrazada · después de 11 PM": (0, "M", "gratis"),
            "Mujer sin disfraz": (80, "M", "puerta"),
            "Hombre · preventa": (70, "H", "preventa"),
            "Hombre disfrazado · en puerta": (90, "H", "puerta"),
            "Hombre sin disfraz · en puerta": (120, "H", "puerta"),
        })

    def test_venta_toma_genero_del_tipo(self):
        venta = VentaBoleto.objects.create(nombre="Luis", tipo=TipoBoleto.objects.get(nombre="Hombre · preventa"))
        self.assertEqual((venta.genero, int(venta.total)), ("H", 70))

    def test_api_publica_expone_modalidad(self):
        data = self.client.get("/api/ticket-types/").json()
        self.assertEqual(len(data), 6)
        self.assertIn("modalidad", data[0])


class BoletoUsuarioTests(TestCase):
    def setUp(self):
        from accounts.models import User

        self.admin = User.objects.create_superuser("admin", "admin@hp.mx", "x")
        self.ana = User.objects.create_user("ana@hp.mx", "ana@hp.mx", "x", first_name="Ana", genero="M")
        self.luis = User.objects.create_user("luis@hp.mx", "luis@hp.mx", "x", first_name="Luis", genero="H")
        self.gratis = TipoBoleto.objects.get(nombre="Mujer disfrazada · antes de 11 PM")

    def test_folio_y_codigo_unicos(self):
        a = VentaBoleto.objects.create(nombre="A", tipo=self.gratis)
        b = VentaBoleto.objects.create(nombre="B", tipo=self.gratis)
        self.assertNotEqual(a.codigo, b.codigo)
        self.assertRegex(a.folio, r"^HP-[0-9A-F]{8}$")

    def test_staff_asigna_boleto_y_lista_usuarios(self):
        self.client.force_login(self.admin)
        resp = self.client.post("/api/sales/", {"nombre": "Ana", "tipo": self.gratis.pk, "usuario": self.ana.pk})
        self.assertEqual(resp.status_code, 201, resp.content)
        folio = resp.json()["folio"]

        # No se puede asignar un segundo boleto vigente.
        dup = self.client.post("/api/sales/", {"nombre": "Ana", "tipo": self.gratis.pk, "usuario": self.ana.pk})
        self.assertEqual(dup.status_code, 400)

        data = self.client.get("/api/users/").json()["results"]
        boletos = {u["first_name"]: u["boleto"] for u in data}
        self.assertEqual(boletos["Ana"]["folio"], folio)
        self.assertIsNone(boletos["Luis"])

        con = self.client.get("/api/users/?boleto=con").json()["results"]
        sin = self.client.get("/api/users/?boleto=sin").json()["results"]
        self.assertEqual([u["first_name"] for u in con], ["Ana"])
        # La lista incluye también al staff/admin; aquí solo interesan los asistentes.
        self.assertEqual([u["first_name"] for u in sin if not u["is_staff"]], ["Luis"])

        por_folio = self.client.get(f"/api/users/?search={folio}").json()["results"]
        self.assertEqual([u["first_name"] for u in por_folio], ["Ana"])

    def test_usuario_ve_su_boleto_y_no_la_lista(self):
        venta = VentaBoleto.objects.create(nombre="Ana", tipo=self.gratis, usuario=self.ana)
        self.client.force_login(self.ana)
        self.assertEqual(self.client.get("/api/auth/me/").json()["boleto"]["folio"], venta.folio)
        self.assertEqual(self.client.get("/api/users/").status_code, 403)

    def test_cancelado_no_cuenta_como_boleto(self):
        VentaBoleto.objects.create(nombre="Luis", tipo=self.gratis, usuario=self.luis, estado="cancelado")
        self.client.force_login(self.luis)
        self.assertIsNone(self.client.get("/api/auth/me/").json()["boleto"])


class EntradaTests(TestCase):
    def setUp(self):
        from accounts.models import User

        self.admin = User.objects.create_superuser("admin", "admin@hp.mx", "x")
        self.ana = User.objects.create_user("ana@hp.mx", "ana@hp.mx", "x", first_name="Ana", genero="M")
        tipo = TipoBoleto.objects.get(nombre="Mujer sin disfraz")
        self.venta = VentaBoleto.objects.create(nombre="Ana", tipo=tipo, usuario=self.ana)
        self.client.force_login(self.admin)

    def test_lookup_por_qr_y_por_folio(self):
        # El QR del boleto contiene "HP:<uuid>".
        por_qr = self.client.get(f"/api/sales/lookup/?codigo=HP:{self.venta.codigo}")
        self.assertEqual(por_qr.status_code, 200)
        self.assertEqual(por_qr.json()["email"], "ana@hp.mx")
        por_folio = self.client.get(f"/api/sales/lookup/?codigo={self.venta.folio.lower()}")
        self.assertEqual(por_folio.json()["id"], self.venta.id)
        self.assertEqual(self.client.get("/api/sales/lookup/?codigo=hola").status_code, 400)
        self.assertEqual(self.client.get("/api/sales/lookup/?codigo=HP-00000000").status_code, 404)

    def test_checkin_una_sola_vez(self):
        url = f"/api/sales/{self.venta.id}/checkin/"
        ok = self.client.post(url)
        self.assertEqual(ok.status_code, 200)
        self.assertIsNotNone(ok.json()["ingreso"])
        self.assertEqual(ok.json()["ingreso_por_nombre"], "admin")
        repetido = self.client.post(url)
        self.assertEqual(repetido.status_code, 409)
        self.assertIn("ya se usó", repetido.json()["detail"])

        self.assertEqual(self.client.delete(url).status_code, 200)
        self.venta.refresh_from_db()
        self.assertIsNone(self.venta.ingreso)
        self.assertEqual(self.client.get("/api/dashboard/kpis/").json()["ingresaron"], 0)

    def test_pendiente_requiere_cobro(self):
        self.venta.estado = "pendiente"
        self.venta.save()
        url = f"/api/sales/{self.venta.id}/checkin/"
        self.assertEqual(self.client.post(url).status_code, 400)
        cobrado = self.client.post(url, {"cobrar": True}, content_type="application/json")
        self.assertEqual(cobrado.status_code, 200)
        self.assertEqual(cobrado.json()["estado"], "pagado")
        self.assertEqual(self.client.get("/api/dashboard/kpis/").json()["ingresaron"], 1)

    def test_cancelado_no_entra_y_solo_staff(self):
        self.venta.estado = "cancelado"
        self.venta.save()
        self.assertEqual(self.client.post(f"/api/sales/{self.venta.id}/checkin/").status_code, 400)
        self.client.force_login(self.ana)
        self.assertEqual(self.client.get(f"/api/sales/lookup/?codigo={self.venta.codigo}").status_code, 403)
