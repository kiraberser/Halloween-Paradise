from django.conf import settings
from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path, re_path
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.permissions import DocsPermission

admin.site.site_header = "Halloween Paradise — Administración"
admin.site.site_title = "Halloween Paradise"


def health(request):
    """Healthcheck para Railway: confirma que Django responde y la BD está accesible."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("api/health/", health, name="health"),
    path(settings.ADMIN_URL, admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("tickets.urls")),
    path("api/", include("finances.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/schema/", SpectacularAPIView.as_view(permission_classes=[DocsPermission]), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema", permission_classes=[DocsPermission]), name="docs"),
]

if settings.SERVE_MEDIA:
    urlpatterns += [
        re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
    ]
