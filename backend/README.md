# Apurímac Turismo — Backend API

## Tecnologías
- **Node.js** v24+ / **Express** 4
- **Prisma** ORM — proveedor MySQL
- **MySQL** 8.0
- **JWT** (jsonwebtoken) — autenticación Bearer
- **bcryptjs** — hash de contraseñas
- **Helmet** + **express-rate-limit** — seguridad

---

## Requisitos previos
- Node.js ≥ 18
- MySQL 8.0 activo y accesible
- npm ≥ 9

---

## Instalación

```bash
cd backend
npm install
```

---

## Configuración de variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

Edita `.env`:

```
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/apurimac_turismo"
JWT_SECRET="cambia_esto_por_un_secreto_largo_y_aleatorio"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ADMIN_SEED_EMAIL=admin@apurimac.pe
ADMIN_SEED_PASSWORD=TU_PASSWORD_ADMIN_SEGURA
```

> ⚠️ **Nunca** subas `.env` a Git. Está en `.gitignore`.

---

## Crear base de datos MySQL

Conéctate a MySQL y ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS apurimac_turismo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

O ejecuta el script de creación:
```bash
# Windows (ajusta la ruta de mysql.exe si es necesario)
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS apurimac_turismo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## Migraciones y esquema (Prisma)

```bash
# Generar el cliente y crear el esquema en MySQL
npm run generate
npm run db:push
```

Este repositorio todavía no incluye migraciones versionadas; `npm run migrate`
solo las aplica cuando existen. Para preparar esta entrega usa `db:push`.

---

## Seed — Datos de demostración

```bash
npm run seed
```

El seed crea:
- El usuario administrador (lee credenciales de `ADMIN_SEED_EMAIL` y `ADMIN_SEED_PASSWORD` del `.env`)
- Destinos, experiencias y hospedajes de Apurímac
- Reservas de ejemplo

> El seed es **idempotente**: si los datos ya existen, no los duplica.

---

## Iniciar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor corre en `http://localhost:4000`

---

## Endpoints principales

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/destinations | Listar destinos |
| GET | /api/v1/destinations/:slug | Detalle de destino |
| GET | /api/v1/experiences | Listar experiencias |
| GET | /api/v1/experiences/:slug | Detalle de experiencia |
| GET | /api/v1/accommodations | Listar hospedajes |
| GET | /api/v1/accommodations/:slug | Detalle de hospedaje |
| POST | /api/v1/reservations | Crear reserva |
| POST | /api/v1/auth/login | Iniciar sesión |
| GET | /api/v1/auth/me | Usuario actual |
| POST | /api/v1/auth/logout | Cerrar sesión |

### Admin (requieren JWT + rol ADMIN)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | /api/v1/admin/destinations | Listar / Crear |
| GET/PUT/DELETE | /api/v1/admin/destinations/:id | Ver / Editar / Eliminar |
| GET/POST | /api/v1/admin/experiences | Listar / Crear |
| GET/PUT/DELETE | /api/v1/admin/experiences/:id | Ver / Editar / Eliminar |
| GET/POST | /api/v1/admin/accommodations | Listar / Crear |
| GET/PUT/DELETE | /api/v1/admin/accommodations/:id | Ver / Editar / Eliminar |
| GET | /api/v1/admin/reservations | Listar todas |
| GET/PATCH/DELETE | /api/v1/admin/reservations/:id | Ver / Cambiar estado / Eliminar |

---

## V2 vs V3

**V2 — Backend + API REST:**
- Node.js + Express
- CORS configurado para frontend
- Endpoints REST en JSON
- Frontend consume la API (no más mock data)

**V3 — Base de datos + Autenticación:**
- MySQL 8.0 con Prisma ORM
- Modelo relacional completo
- Migraciones versionadas
- Hash bcryptjs en contraseñas
- JWT para autenticación
- Roles ADMIN / USER
- CRUD persistente

---

## Pruebas con Postman

Para ejecutar las pruebas automáticas del backend:

```bash
cd backend
npm test
```

Con el backend en marcha, ejecuta desde la carpeta principal del proyecto:

```bash
node verificar.js --build --api http://localhost:4000/api/v1/experiences --origin http://localhost:5173
```

`--origin` debe coincidir con `FRONTEND_URL`: CORS permite el frontend configurado,
no todos los orígenes. El verificador también comprueba el historial de Git; su
conteo de commits es orientativo y no afecta el funcionamiento de la API.

Importa la colección o prueba manualmente:

```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@apurimac.pe","password":"TU_PASSWORD"}'

# Usar el token devuelto:
curl http://localhost:4000/api/v1/admin/reservations \
  -H "Authorization: Bearer <token>"
```
