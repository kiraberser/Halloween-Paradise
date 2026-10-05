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
