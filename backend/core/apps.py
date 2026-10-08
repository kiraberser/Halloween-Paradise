from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "core"
    verbose_name = "Núcleo"

    def ready(self):
        # Conecta los receptores de señales de seguridad (login fallido, accesos de staff).
        from . import seguridad  # noqa: F401
