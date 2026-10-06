# 🎃 Halloween Paradise

Landing, venta de boletos y dashboard para la fiesta **Halloween Paradise** — 31 de octubre de 2026, Martínez de la Torre, Veracruz.

- **frontend/** — Next.js 15 (App Router, TypeScript, Tailwind v4, Recharts) → Vercel
- **backend/** — Django 5 + Django REST Framework + SimpleJWT + Cloudinary → Railway (PostgreSQL; SQLite en local)

## Funcionalidades

| Público | Usuario registrado | Staff / superuser |
|---|---|---|
| Landing con cuenta regresiva, boletos (precios desde la API), FAQ y mapa | Registro con foto de perfil | Dashboard con KPIs: boletos, ingresos, costos, gastos, utilidad, usuarios |
| Botón **Comprar boleto** → Messenger / Instagram | Editar perfil y cambiar foto | Gráficas: registros en el tiempo, género, edad, tipo de boleto, canal, gastos por categoría, fijos vs variables |
| | | Captura de ventas y de costos/gastos |
| | | **Imágenes**: fotos de perfil listas para imprimir como decoración |
| | | Django Admin en `/admin/` |

## Despliegue: backend en Railway + frontend en Vercel

Repositorio: https://github.com/kiraberser/Halloween-Paradise

### 1. Preparación
1. En Cloudinary → *Settings → API Keys*, copia la **API environment variable** (`cloudinary://API_KEY:API_SECRET@CLOUD_NAME`).
2. Genera una clave secreta para Django:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(50))"
   ```

### 2. Backend en Railway
1. **New Project → Deploy PostgreSQL**.
2. **New → GitHub Repo → kiraberser/Halloween-Paradise**, y en *Settings* del servicio:
   - **Root Directory:** `/backend`
   - **Config file path:** `/backend/railway.json` (Railway no aplica la Root Directory a este archivo)
   - **Networking → Generate Domain** → anota la URL, p. ej. `https://halloween-paradise-api.up.railway.app`
3. Variables del servicio:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `DJANGO_SECRET_KEY` | la clave generada |
| `CLOUDINARY_URL` | `cloudinary://…` |
| `CORS_ALLOWED_ORIGINS` | URL de producción de Vercel, p. ej. `https://halloween-paradise.vercel.app` |
| `CORS_ALLOWED_ORIGIN_REGEXES` | opcional, para previews: `^https://halloween-paradise-.*\.vercel\.app$` |
| `DJANGO_SUPERUSER_USERNAME` / `_EMAIL` / `_PASSWORD` | datos del administrador |
| `EVENT_CAPACITY` | cupo del lugar (opcional, 500 por defecto) |
| `CLOUDINARY_FOLDER` | opcional, `halloween-paradise` por defecto |

### 3. Frontend en Vercel
1. **Add New → Project → Import** `kiraberser/Halloween-Paradise`.
2. **Root Directory:** `frontend` (Vercel detecta Next.js solo).
3. *Environment Variables*:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend en Railway (sin `/` final) |
| `NEXT_PUBLIC_MESSENGER_URL` | `https://m.me/<pagina>` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://ig.me/m/<usuario>` |

4. **Deploy**. Después copia la URL final de Vercel en `CORS_ALLOWED_ORIGINS` del backend (Railway redespliega solo al cambiar variables).

> Las variables `NEXT_PUBLIC_*` se incrustan en el build: si las cambias, haz *Redeploy* en Vercel.

### 4. Qué pasa en cada despliegue del backend
- **Build:** instala dependencias y ejecuta `collectstatic` (WhiteNoise sirve el CSS del admin).
- **Pre-deploy** (`release.sh`): `migrate`, crea los tipos de boleto iniciales y el superuser si no existe.
- **Arranque:** gunicorn en el `PORT` de Railway; healthcheck en `/api/health/` (verifica también la BD).
- `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` incluyen automáticamente `RAILWAY_PUBLIC_DOMAIN`.

> **¿Y el `Procfile`?** Con `"builder": "DOCKERFILE"` Railway lo ignora y arranca con el `CMD` del Dockerfile. `backend/Procfile` solo se usa si cambias el builder a Railpack o eliminas el Dockerfile; en ese caso hace todo al arrancar: migraciones, `collectstatic` y gunicorn.

Con un dominio propio, agrégalo a `DJANGO_ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` y `CORS_ALLOWED_ORIGINS`, y redespliega en Vercel si cambia `NEXT_PUBLIC_API_URL`.

### Imágenes en Cloudinary
Con `CLOUDINARY_URL` definida, las fotos de perfil y los comprobantes se suben a `CLOUDINARY_FOLDER/perfiles` y `CLOUDINARY_FOLDER/comprobantes`. Al cambiar la foto se borra la anterior. La hoja de fotos para imprimir usa una versión recortada 4:5 centrada en la cara (`c_fill,g_face`) para imprimir. Sin `CLOUDINARY_URL`, los archivos se guardan en disco (desarrollo local).

## Arranque con Docker

```bash
cp .env.example .env    # edita contraseñas, clave secreta y enlaces de Messenger/Instagram
docker compose up --build
```

- Frontend: http://localhost:3000
- API / Swagger: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/

El contenedor del backend aplica migraciones, crea los tipos de boleto iniciales y el superuser definido en `DJANGO_SUPERUSER_*`.

## Arranque local sin Docker (Windows)

Backend (usa SQLite si no hay `DATABASE_URL`):

```bash
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python manage.py migrate
.venv\Scripts\python manage.py createsuperuser
.venv\Scripts\python manage.py seed_demo        # datos de prueba (opcional)
.venv\Scripts\python manage.py runserver
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Variables del frontend en `frontend/.env.local` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MESSENGER_URL`, `NEXT_PUBLIC_INSTAGRAM_URL`).

## API REST (`/api/`)

| Endpoint | Permiso |
|---|---|
| `POST auth/register/` (multipart con `foto_perfil`) | público |
| `POST auth/token/` · `POST auth/token/refresh/` (login con correo o usuario) | público |
| `GET/PATCH auth/me/` | autenticado |
| `GET ticket-types/` | público (solo activos) |
| `POST/PUT/DELETE ticket-types/` | staff |
| `CRUD sales/` — filtros `estado`, `tipo`, `canal`, `genero`, `fecha_venta__date__gte/lte`, `search` | staff |
| `CRUD expenses/` — filtros `tipo`, `naturaleza`, `categoria`, `fecha__gte/lte` | staff |
| `GET dashboard/kpis/` · `demographics/` · `timeline/` · `sales-breakdown/` · `expenses-breakdown/` | staff |
| `GET users/photos/` (fotos para imprimir como decoración) | staff |

Los ingresos y boletos vendidos solo cuentan ventas con estado **Pagado**.

## Modelos

- **VentaBoleto**: nombre, tipo (FK a TipoBoleto), precio (se copia del tipo si se omite), cantidad, género, canal, estado, usuario (opcional), fecha, notas.
- **TipoBoleto**: nombre, precio, cupo, activo, orden.
- **MovimientoFinanciero**: concepto, tipo (costo/gasto), naturaleza (fijo/variable), categoría, monto, fecha, proveedor, comprobante.
- **User** (personalizado): correo único, teléfono, género, fecha de nacimiento, foto de perfil (JPG/PNG/WEBP, máx. 5 MB).

## Pruebas

```bash
cd backend
.venv\Scripts\python manage.py test
```

## Pendiente de confirmar

Datos del evento en `frontend/lib/event.ts` y `.env`: lugar y dirección, hora, enlaces reales de Messenger/Instagram, precios y cupos reales (editables en el admin), capacidad (`EVENT_CAPACITY`), edad mínima y dominio de producción (`DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_URL`).
