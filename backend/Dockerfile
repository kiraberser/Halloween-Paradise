FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x release.sh \
    && DJANGO_BUILD=1 python manage.py collectstatic --noinput \
    # Usuario sin privilegios: si alguien lograra ejecutar código, no sería root en el contenedor.
    && useradd --create-home --uid 1000 app \
    && mkdir -p /app/media \
    && chown -R app:app /app

USER app

EXPOSE 8000
# Railway define PORT; en local se usa 8000.
CMD ["sh", "-c", "gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers ${WEB_CONCURRENCY:-3} --timeout 60 --access-logfile -"]
