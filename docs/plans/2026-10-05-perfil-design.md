# Diseño: página de perfil

Fecha: 2026-10-05

## Objetivo
Convertir `/perfil` de un formulario a un panel útil para cada tipo de persona:
- **Usuario:** su boleto listo para enseñar en la puerta, cuánto falta, qué le falta preparar y cómo invitar amigos.
- **Staff/admin:** además, accesos rápidos a la operación del evento y cifras en vivo, sin datos de dinero.

## Estructura (una columna en celular)
1. Encabezado: foto, nombre, etiqueta Admin/Staff, aviso de bienvenida tras el registro.
2. Panel de staff: Escanear QR (destacado), Registrar venta, Usuarios, Panel; cifras: vendidos, ya entraron, registrados.
3. Mi boleto: la tarjeta del boleto con QR (la misma del modal del dashboard). Sin boleto, mensaje según género: mujer → entrada gratis disfrazada; hombre → comprar preventa $70; otro → ver precios.
4. Faltan (cuenta regresiva) + Prepárate (cuenta, foto y boleto se marcan solos; "disfraz listo" lo marca la persona y se recuerda en su navegador).
5. Invitar amigos: compartir nativo del celular, WhatsApp y copiar link.
6. Mis datos: formulario plegable; abierto si no hay foto o si viene de registrarse.

## Decisiones
- Sin cambios de backend: todo sale de `/api/auth/me/` y `/api/dashboard/kpis/`.
- "Registrar venta" lleva a la página de Ventas (sin modal propio).
- `TicketCard` se extrajo de `TicketModal` para reusar el boleto en el perfil y en el dashboard.
