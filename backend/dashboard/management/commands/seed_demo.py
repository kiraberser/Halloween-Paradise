"""Crea tipos de boleto y datos de demostración para probar el dashboard.

Uso:
    python manage.py seed_demo            # tipos de boleto + datos demo
    python manage.py seed_demo --solo-tipos
    python manage.py seed_demo --limpiar  # borra ventas, gastos y usuarios demo antes
"""
import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Genero, User
from finances.models import MovimientoFinanciero
from tickets.models import TipoBoleto, VentaBoleto

TIPOS = [
    ("Preventa", "Precio especial por tiempo limitado", "250.00", 150, 1),
    ("General", "Acceso general a la fiesta", "350.00", 300, 2),
    ("VIP", "Zona VIP, cover con bebida y acceso preferente", "600.00", 50, 3),
]
PESOS = {"Preventa": 3, "General": 5, "VIP": 1}

NOMBRES = ["Ana", "Luis", "María", "José", "Fernanda", "Carlos", "Valeria", "Diego", "Sofía", "Jorge",
           "Daniela", "Miguel", "Paola", "Ricardo", "Ximena", "Andrés", "Karla", "Emilio", "Regina", "Óscar"]
APELLIDOS = ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Rodríguez", "Sánchez",
             "Ramírez", "Cruz", "Morales", "Domínguez", "Vázquez", "Lara"]

GASTOS = [
    ("Renta del salón", "costo", "fijo", "renta", "15000"),
    ("DJ y equipo de sonido", "costo", "fijo", "sonido", "8000"),
    ("Iluminación y humo", "costo", "fijo", "iluminacion", "4500"),
    ("Decoración temática", "costo", "variable", "decoracion", "6000"),
    ("Bebidas y hielo", "costo", "variable", "bebidas", "9500"),
    ("Seguridad (4 elementos)", "gasto", "fijo", "seguridad", "4000"),
    ("Publicidad en Facebook/Instagram", "gasto", "variable", "publicidad", "2500"),
    ("Pulseras y boletos impresos", "gasto", "variable", "otros", "900"),
    ("Staff de barra y acceso", "gasto", "variable", "staff", "3600"),
    ("Permiso municipal", "gasto", "fijo", "permisos", "1800"),
]


class Command(BaseCommand):
    help = "Siembra tipos de boleto y datos de demostración."

    def add_arguments(self, parser):
        parser.add_argument("--solo-tipos", action="store_true")
        parser.add_argument("--limpiar", action="store_true")
        parser.add_argument("--usuarios", type=int, default=60)
        parser.add_argument("--ventas", type=int, default=90)

    def handle(self, *args, **opts):
        for nombre, desc, precio, cupo, orden in TIPOS:
            TipoBoleto.objects.update_or_create(
                nombre=nombre, defaults={"descripcion": desc, "precio": Decimal(precio), "cupo": cupo, "orden": orden}
            )
        self.stdout.write(self.style.SUCCESS(f"{len(TIPOS)} tipos de boleto listos."))
        if opts["solo_tipos"]:
            return

        if opts["limpiar"]:
            VentaBoleto.objects.all().delete()
            MovimientoFinanciero.objects.all().delete()
            User.objects.filter(email__endswith="@demo.paradise").delete()

        rnd = random.Random(31)
        ahora = timezone.now()
        generos = [Genero.HOMBRE, Genero.MUJER, Genero.MUJER, Genero.HOMBRE, Genero.OTRO, Genero.NO_DICE]

        usuarios = []
        for i in range(opts["usuarios"]):
            nombre, apellido = rnd.choice(NOMBRES), rnd.choice(APELLIDOS)
            email = f"demo{i}@demo.paradise"
            user, creado = User.objects.get_or_create(
                username=email,
                defaults={
                    "email": email, "first_name": nombre, "last_name": apellido,
                    "genero": rnd.choice(generos),
                    "fecha_nacimiento": date(rnd.randint(1985, 2007), rnd.randint(1, 12), rnd.randint(1, 28)),
                },
            )
            if creado:
                user.set_unusable_password()
                user.save()
                User.objects.filter(pk=user.pk).update(date_joined=ahora - timedelta(days=rnd.randint(0, 25)))
            usuarios.append(user)

        tipos = list(TipoBoleto.objects.all())
        canales = [VentaBoleto.Canal.MESSENGER] * 5 + [VentaBoleto.Canal.INSTAGRAM] * 4 + [VentaBoleto.Canal.TAQUILLA]
        estados = [VentaBoleto.Estado.PAGADO] * 8 + [VentaBoleto.Estado.PENDIENTE, VentaBoleto.Estado.CANCELADO]
        for _ in range(opts["ventas"]):
            usuario = rnd.choice(usuarios + [None] * 20)
            venta = VentaBoleto.objects.create(
                nombre=usuario.get_full_name() if usuario else f"{rnd.choice(NOMBRES)} {rnd.choice(APELLIDOS)}",
                tipo=rnd.choices(tipos, weights=[PESOS.get(t.nombre, 2) for t in tipos])[0],
                cantidad=rnd.choice([1, 1, 1, 2, 2, 3, 4]),
                genero=usuario.genero if usuario else rnd.choice(generos),
                usuario=usuario,
                canal=rnd.choice(canales),
                estado=rnd.choice(estados),
            )
            VentaBoleto.objects.filter(pk=venta.pk).update(fecha_venta=ahora - timedelta(days=rnd.randint(0, 25)))

        for concepto, tipo, naturaleza, categoria, monto in GASTOS:
            MovimientoFinanciero.objects.get_or_create(
                concepto=concepto,
                defaults={
                    "tipo": tipo, "naturaleza": naturaleza, "categoria": categoria, "monto": Decimal(monto),
                    "fecha": timezone.localdate() - timedelta(days=rnd.randint(0, 20)),
                },
            )

        self.stdout.write(self.style.SUCCESS(
            f"Demo lista: {len(usuarios)} usuarios, {opts['ventas']} ventas, {len(GASTOS)} costos/gastos."
        ))
