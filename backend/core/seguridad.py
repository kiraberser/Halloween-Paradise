"""Registro de eventos de seguridad (logins fallidos, cambios de permisos, borrados, entradas).

Los mensajes van al logger ``paradise.seguridad`` (consola → logs de Railway). Todo valor que viene
del usuario se sanea para evitar inyección de líneas falsas en los logs.
"""
import logging
import re

from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_login_failed
from django.dispatch import receiver

logger = logging.getLogger("paradise.seguridad")

_CONTROL = re.compile(r"[\x00-\x1f\x7f]")


def limpiar(valor, largo=80):
    """Quita saltos de línea/caracteres de control y recorta (anti log-injection)."""
    return _CONTROL.sub(" ", str(valor))[:largo]


def ip_cliente(request):
    """IP del cliente; detrás de un proxy confiable (Railway) toma el último salto de X-Forwarded-For."""
    if request is None:
        return "-"
    saltos = settings.REST_FRAMEWORK.get("NUM_PROXIES", 0) or 0
    xff = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if saltos and xff:
        partes = [p.strip() for p in xff.split(",") if p.strip()]
        if len(partes) >= saltos:
            return limpiar(partes[-saltos], 45)
    return limpiar(request.META.get("REMOTE_ADDR", "-"), 45)


def quien(request):
    user = getattr(request, "user", None)
    return limpiar(user.get_username()) if user and user.is_authenticated else "anónimo"


def evento(accion, request=None, /, **datos):
    """Registra una acción sensible con quién la hizo y desde qué IP (``datos`` se sanean)."""
    detalle = " ".join(f"{k}={limpiar(v)}" for k, v in datos.items())
    logger.info("%s por=%s ip=%s %s", accion, quien(request), ip_cliente(request), detalle)


@receiver(user_login_failed)
def login_fallido(sender, credentials, request=None, **kwargs):
    logger.warning("login_fallido usuario=%s ip=%s", limpiar(credentials.get("username", "")), ip_cliente(request))


@receiver(user_logged_in)
def login_staff(sender, request, user, **kwargs):
    # Solo se registran los accesos de staff (los del público serían ruido).
    if user.is_staff:
        logger.info("login_staff usuario=%s ip=%s", limpiar(user.get_username()), ip_cliente(request))
