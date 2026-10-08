#!/bin/sh
# Se ejecuta antes de cada despliegue (preDeployCommand en Railway; al arrancar en docker-compose).
set -e

python manage.py migrate --noinput
# Tabla de caché compartida (la usan los límites de peticiones).
python manage.py createcachetable

# Crea el superuser si se definieron DJANGO_SUPERUSER_* y aún no existe.
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput 2>/dev/null || echo "Superuser ya existe."
fi
