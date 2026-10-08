"""Configuración de Django para Halloween Paradise."""
from datetime import timedelta
from pathlib import Path
from urllib.parse import unquote, urlparse

import dj_database_url
from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEV_SECRET_KEY = "dev-insecure-halloween-paradise-cambia-esta-clave-2026"
SECRET_KEY = config("DJANGO_SECRET_KEY", default=DEV_SECRET_KEY)
DEBUG = config("DJANGO_DEBUG", default=False, cast=bool)
if not DEBUG and SECRET_KEY == DEV_SECRET_KEY and not config("DJANGO_BUILD", default=False, cast=bool):
    raise ImproperlyConfigured("Define DJANGO_SECRET_KEY en producción.")

ALLOWED_HOSTS = config("DJANGO_ALLOWED_HOSTS", default="localhost,127.0.0.1", cast=Csv())
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())

# Railway expone el dominio público del servicio en RAILWAY_PUBLIC_DOMAIN.
RAILWAY_PUBLIC_DOMAIN = config("RAILWAY_PUBLIC_DOMAIN", default="")
if RAILWAY_PUBLIC_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_PUBLIC_DOMAIN)
    CSRF_TRUSTED_ORIGINS.append(f"https://{RAILWAY_PUBLIC_DOMAIN}")
# Healthcheck interno de Railway.
ALLOWED_HOSTS.append("healthcheck.railway.app")

# Railway termina HTTPS en su proxy y reenvía la petición por HTTP.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# Cabeceras de seguridad en producción (Railway siempre sirve por HTTPS).
EN_RAILWAY = bool(RAILWAY_PUBLIC_DOMAIN)
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=EN_RAILWAY, cast=bool)
SECURE_REDIRECT_EXEMPT = [r"^api/health/$"]  # el healthcheck interno de Railway llega por HTTP
SECURE_HSTS_SECONDS = config("SECURE_HSTS_SECONDS", default=60 * 60 * 24 * 30 if EN_RAILWAY else 0, cast=int)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Ruta del admin de Django: conviene cambiarla en producción (p. ej. ADMIN_URL=panel-hp-7x2/).
ADMIN_URL = config("ADMIN_URL", default="admin/")
# Documentación de la API (Swagger): pública solo en desarrollo; en producción, solo staff.
API_DOCS_PUBLIC = config("API_DOCS_PUBLIC", default=DEBUG, cast=bool)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceros
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Locales
    "core",
    "accounts",
    "tickets",
    "finances",
    "dashboard",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# PostgreSQL vía DATABASE_URL (Docker); SQLite como respaldo para desarrollo local.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

# Caché en la base de datos: compartida entre los workers de gunicorn (la usan los límites de peticiones).
CACHES = {
    "default": {"BACKEND": "django.core.cache.backends.db.DatabaseCache", "LOCATION": "cache_paradise"},
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Cloudinary: si existe CLOUDINARY_URL (cloudinary://API_KEY:API_SECRET@CLOUD_NAME) las fotos
# y comprobantes se suben ahí; si no, se guardan en disco (desarrollo local / Docker).
CLOUDINARY_URL = config("CLOUDINARY_URL", default="")
CLOUDINARY_FOLDER = config("CLOUDINARY_FOLDER", default="halloween-paradise")
if CLOUDINARY_URL:
    import cloudinary

    _cld = urlparse(CLOUDINARY_URL)
    cloudinary.config(
        cloud_name=_cld.netloc.rsplit("@", 1)[-1], api_key=unquote(_cld.username or ""),
        api_secret=unquote(_cld.password or ""), secure=True,
    )

STORAGES = {
    "default": {
        "BACKEND": "core.storage.CloudinaryMediaStorage" if CLOUDINARY_URL
        else "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
# Sin Cloudinary, Django sirve /media/ directamente (suficiente para un evento pequeño).
SERVE_MEDIA = config("SERVE_MEDIA", default=not CLOUDINARY_URL, cast=bool)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 50,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    # La API navegable solo en desarrollo; en producción, únicamente JSON.
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"]
    + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    # Límites de peticiones por IP (anónimos) y por usuario. Los límites son holgados porque mucha
    # gente comparte IP en datos móviles; login y registro tienen límites propios más estrictos.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": config("THROTTLE_ANON", default="300/min"),
        "user": config("THROTTLE_USER", default="600/min"),
        "login": config("THROTTLE_LOGIN", default="15/min"),
        "registro": config("THROTTLE_REGISTRO", default="30/hour"),
    },
    # Detrás del proxy de Railway la IP real llega en X-Forwarded-For (1 salto).
    "NUM_PROXIES": config("NUM_PROXIES", default=1 if EN_RAILWAY else 0, cast=int),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # Cada renovación entrega un refresh nuevo e invalida el anterior (y el logout lo revoca).
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Halloween Paradise API",
    "DESCRIPTION": "Venta de boletos, costos/gastos y KPIs del evento (31 de octubre, Martínez de la Torre, Ver.)",
    "VERSION": "1.0.0",
}

CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="http://localhost:3000", cast=Csv())
# Para los previews de Vercel, p. ej.: ^https://halloween-paradise-.*\.vercel\.app$
CORS_ALLOWED_ORIGIN_REGEXES = config("CORS_ALLOWED_ORIGIN_REGEXES", default="", cast=Csv())

# Datos del evento
EVENT_NAME = "Halloween Paradise"
EVENT_CAPACITY = config("EVENT_CAPACITY", default=500, cast=int)

# Registro de eventos de seguridad (logins fallidos, cambios de permisos, borrados) en la consola,
# que Railway guarda en sus logs.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {"simple": {"format": "{levelname} {name} {message}", "style": "{"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "simple"}},
    "loggers": {
        "django.security": {"handlers": ["console"], "level": "WARNING", "propagate": False},
        "paradise.seguridad": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
