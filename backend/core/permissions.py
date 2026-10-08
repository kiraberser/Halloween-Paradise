from django.conf import settings
from rest_framework import permissions


class IsStaffOrReadOnly(permissions.BasePermission):
    """Lectura pública; escritura solo para staff y borrado solo para el admin."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if getattr(view, "action", None) == "destroy":
            return bool(request.user and request.user.is_superuser)
        return bool(request.user and request.user.is_staff)


class IsStaffNoDelete(permissions.BasePermission):
    """El staff ve, crea y edita; eliminar registros (ventas, gastos) es solo del admin."""

    message = "Solo el administrador puede eliminar registros."

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_staff):
            return False
        if getattr(view, "action", None) == "destroy":
            return user.is_superuser
        return True


class IsSuperuser(permissions.BasePermission):
    message = "Solo el administrador puede hacer esto."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class DocsPermission(permissions.BasePermission):
    """Documentación de la API: pública en desarrollo (API_DOCS_PUBLIC); en producción, solo staff."""

    def has_permission(self, request, view):
        return settings.API_DOCS_PUBLIC or bool(request.user and request.user.is_staff)
