"""Endpoints de KPIs y series para el dashboard (solo staff)."""
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.db.models import Count, DecimalField, ExpressionWrapper, F, Q, Sum
from django.db.models.functions import Coalesce, TruncDate
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Genero, User
from finances.models import MovimientoFinanciero
from tickets.models import TipoBoleto, VentaBoleto

CERO = Decimal("0")
IMPORTE = ExpressionWrapper(F("precio") * F("cantidad"), output_field=DecimalField(max_digits=14, decimal_places=2))
RANGOS_EDAD = [(18, 20), (21, 25), (26, 30), (31, 40), (41, 200)]


def ventas_pagadas():
    return VentaBoleto.objects.filter(estado=VentaBoleto.Estado.PAGADO)


def etiqueta_genero(clave):
    return dict(Genero.choices).get(clave, clave)


def edad(nacimiento, hoy):
    return hoy.year - nacimiento.year - ((hoy.month, hoy.day) < (nacimiento.month, nacimiento.day))


def rango_edad(años):
    if años < RANGOS_EDAD[0][0]:
        return f"<{RANGOS_EDAD[0][0]}"
    for minimo, maximo in RANGOS_EDAD:
        if minimo <= años <= maximo:
            return f"{minimo}+" if maximo >= 200 else f"{minimo}-{maximo}"
    return "Otro"


class StaffAPIView(APIView):
    permission_classes = [IsAdminUser]


class KPIsView(StaffAPIView):
    def get(self, request):
        ventas = ventas_pagadas().aggregate(
            boletos=Coalesce(Sum("cantidad"), 0),
            ingresos=Coalesce(Sum(IMPORTE), CERO),
            num_ventas=Count("id"),
        )
        movs = MovimientoFinanciero.objects
        costos = movs.filter(tipo="costo").aggregate(t=Coalesce(Sum("monto"), CERO))["t"]
        gastos = movs.filter(tipo="gasto").aggregate(t=Coalesce(Sum("monto"), CERO))["t"]
        pendientes = VentaBoleto.objects.filter(estado=VentaBoleto.Estado.PENDIENTE).aggregate(
            t=Coalesce(Sum("cantidad"), 0)
        )["t"]
        capacidad = settings.EVENT_CAPACITY
        ingresos = ventas["ingresos"]
        return Response({
            "boletos_vendidos": ventas["boletos"],
            "boletos_pendientes": pendientes,
            "num_ventas": ventas["num_ventas"],
            "ingresos": ingresos,
            "costos": costos,
            "gastos": gastos,
            "utilidad": ingresos - costos - gastos,
            "ticket_promedio": (ingresos / ventas["boletos"]).quantize(Decimal("0.01")) if ventas["boletos"] else CERO,
            "usuarios_registrados": User.objects.filter(is_staff=False).count(),
            "fotos_subidas": User.objects.exclude(foto_perfil="").exclude(foto_perfil__isnull=True).count(),
            "capacidad": capacidad,
            "ocupacion_pct": round(ventas["boletos"] * 100 / capacidad, 1) if capacidad else 0,
        })


class DemographicsView(StaffAPIView):
    def get(self, request):
        ventas_genero = [
            {"genero": etiqueta_genero(r["genero"]), "boletos": r["boletos"]}
            for r in ventas_pagadas().values("genero").annotate(boletos=Sum("cantidad")).order_by("genero")
        ]
        usuarios = User.objects.filter(is_staff=False)
        usuarios_genero = [
            {"genero": etiqueta_genero(r["genero"]), "usuarios": r["n"]}
            for r in usuarios.values("genero").annotate(n=Count("id")).order_by("genero")
        ]
        hoy = date.today()
        conteo = {}
        for nacimiento in usuarios.exclude(fecha_nacimiento=None).values_list("fecha_nacimiento", flat=True):
            r = rango_edad(edad(nacimiento, hoy))
            conteo[r] = conteo.get(r, 0) + 1
        orden = [f"<{RANGOS_EDAD[0][0]}"] + [rango_edad(m) for m, _ in RANGOS_EDAD]
        edades = [{"rango": r, "usuarios": conteo[r]} for r in orden if r in conteo]
        return Response({"ventas_por_genero": ventas_genero, "usuarios_por_genero": usuarios_genero, "edades": edades})


class TimelineView(StaffAPIView):
    """Registros de usuarios y boletos vendidos por día (con acumulados)."""

    def get(self, request):
        registros = dict(
            User.objects.filter(is_staff=False)
            .annotate(dia=TruncDate("date_joined"))
            .values("dia").annotate(n=Count("id")).values_list("dia", "n")
        )
        boletos = {
            r["dia"]: r
            for r in ventas_pagadas().annotate(dia=TruncDate("fecha_venta"))
            .values("dia").annotate(boletos=Sum("cantidad"), ingresos=Sum(IMPORTE))
        }
        serie, acum_reg, acum_bol = [], 0, 0
        for dia in sorted(set(registros) | set(boletos)):
            n_reg = registros.get(dia, 0)
            n_bol = boletos.get(dia, {}).get("boletos", 0)
            acum_reg += n_reg
            acum_bol += n_bol
            serie.append({
                "fecha": dia.isoformat(),
                "registros": n_reg,
                "boletos": n_bol,
                "ingresos": boletos.get(dia, {}).get("ingresos", CERO),
                "registros_acumulados": acum_reg,
                "boletos_acumulados": acum_bol,
            })
        return Response(serie)


class SalesBreakdownView(StaffAPIView):
    def get(self, request):
        por_tipo = [
            {"tipo": r["tipo__nombre"], "boletos": r["boletos"], "ingresos": r["ingresos"]}
            for r in ventas_pagadas().values("tipo__nombre").annotate(boletos=Sum("cantidad"), ingresos=Sum(IMPORTE))
            .order_by("-boletos")
        ]
        canales = dict(VentaBoleto.Canal.choices)
        por_canal = [
            {"canal": canales.get(r["canal"], r["canal"]), "boletos": r["boletos"]}
            for r in ventas_pagadas().values("canal").annotate(boletos=Sum("cantidad")).order_by("-boletos")
        ]
        estados = dict(VentaBoleto.Estado.choices)
        por_estado = [
            {"estado": estados.get(r["estado"], r["estado"]), "boletos": r["boletos"]}
            for r in VentaBoleto.objects.values("estado").annotate(boletos=Sum("cantidad")).order_by("estado")
        ]
        cupos = [
            {"tipo": t.nombre, "cupo": t.cupo, "vendidos": t.vendidos or 0}
            for t in TipoBoleto.objects.filter(cupo__isnull=False).annotate(
                vendidos=Sum("ventas__cantidad", filter=Q(ventas__estado=VentaBoleto.Estado.PAGADO))
            )
        ]
        return Response({"por_tipo": por_tipo, "por_canal": por_canal, "por_estado": por_estado, "cupos": cupos})


class ExpensesBreakdownView(StaffAPIView):
    def get(self, request):
        movs = MovimientoFinanciero.objects
        categorias = dict(MovimientoFinanciero.Categoria.choices)
        por_categoria = [
            {"categoria": categorias.get(r["categoria"], r["categoria"]), "monto": r["monto"]}
            for r in movs.values("categoria").annotate(monto=Sum("monto")).order_by("-monto")
        ]
        matriz = {
            (r["tipo"], r["naturaleza"]): r["monto"]
            for r in movs.values("tipo", "naturaleza").annotate(monto=Sum("monto"))
        }
        por_naturaleza = [
            {
                "naturaleza": etiqueta,
                "costos": matriz.get(("costo", clave), CERO),
                "gastos": matriz.get(("gasto", clave), CERO),
            }
            for clave, etiqueta in MovimientoFinanciero.Naturaleza.choices
        ]
        return Response({"por_categoria": por_categoria, "por_naturaleza": por_naturaleza})
