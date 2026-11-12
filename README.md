# Apurímac Turismo — Plataforma de E-commerce y Reservas (V1 + V2 + V3)

**Autor:** Morón Luna, Jesús Alejandro  
**Estado:** V1 (Frontend React) + V2 (Backend Node/Express REST API) + V3 (Persistencia MySQL + Prisma + Auth JWT/bcrypt) completadas.

---

## 1. Descripción del Proyecto

Apurímac Turismo es una plataforma web para descubrir y reservar experiencias turísticas vivenciales y alojamientos rurales en la región de Apurímac, Perú (Abancay, Andahuaylas, Choquequirao, Curahuasi, etc.).

La plataforma incluye:
- **Catálogo público:** Exploración de experiencias, hospedajes y destinos con filtros por categoría, duración, precio y búsqueda de texto.
- **Flujo de reservas:** Selección de fechas, pasajeros y cálculo automático y seguro de subtotales y tarifas de servicio en el servidor.
- **Autenticación y Roles:** Modal de login seguro con JWT y contraseñas hasheadas con bcrypt (roles `ADMIN` y `USER`).
- **Panel de Administración Protegido:** Dashboard de métricas, gestión de reservas (cambio de estado y eliminación), y catálogo interactivo de experiencias y hospedajes persistente en base de datos MySQL.

---

## 2. Tecnologías Utilizadas

### Frontend (`ecommerce-frontend`)
- **React 19** + **Vite 6**
- **React Router DOM 7**
- **Vanilla CSS** con sistema de diseño modular basado en tokens (variables CSS para paleta andina, tipografías y espaciado).
- **Fetch API** con cliente centralizado (`src/services/api.js`).

### Backend (`backend`)
- **Node.js** (v24.x) + **Express 4**
- **MySQL 8.0** como motor de base de datos relacional.
- **Prisma ORM 6** para modelado de datos, generación de cliente y migraciones.
- **jsonwebtoken (JWT)** para emisión y validación de tokens de sesión en cabecera `Authorization: Bearer <token>`.
- **bcryptjs** para hashing seguro de contraseñas con salt rounds (costo 12).
- **Helmet** y **express-rate-limit** para endurecimiento HTTP y protección contra fuerza bruta.
- **CORS** configurado para permitir el frontend (`http://localhost:5173`).

---

## 3. Estructura del Repositorio

```
comercio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema relacional MySQL
│   │   └── seed.js             # Script de población idempotente
│   ├── src/
│   │   ├── config/database.js  # Singleton de PrismaClient
│   │   ├── controllers/        # Controladores REST (auth, dest, exp, acc, reservas)
│   │   ├── middleware/         # auth (JWT), errorHandler, validate
│   │   ├── routes/             # auth.js, public.js, admin.js
│   │   ├── app.js              # Configuración de Express (CORS, Helmet, RateLimit)
│   │   └── server.js           # Inicio del servidor
│   ├── .env                    # Variables locales (ignorado en git)
│   ├── .env.example            # Plantilla de variables
│   └── package.json
├── ecommerce-frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, LoginModal, Cards
│   │   ├── context/            # AuthContext.jsx
│   │   ├── pages/              # Home, Experiences, Accommodations, Booking, Admin
│   │   ├── services/api.js     # Cliente API HTTP
│   │   └── index.css           # Tokens y estilos globales
│   └── package.json
└── README.md
```

---

## 4. Estructura de la Base de Datos (MySQL)

El modelo relacional está compuesto por 5 entidades principales en `apurimac_turismo`:

1. **`users`**:
   - `id` (INT PK AI)
   - `nombre`, `apellido`, `email` (UNIQUE), `password_hash` (VARCHAR 255), `role` (ENUM: `ADMIN`, `USER`), `activo` (BOOLEAN), `created_at`, `updated_at`.
2. **`destinations`**:
   - `id` (INT PK AI), `nombre`, `slug` (UNIQUE), `province`, `description` (TEXT), `image`, `altitude`, `climate`, `highlights` (JSON), `publicado`.
3. **`experiences`**:
   - `id` (INT PK AI), `nombre`, `slug` (UNIQUE), `short_description`, `description` (TEXT), `category`, `location`, `district`, `duration`, `difficulty`, `group_size`, `price` (DECIMAL 10,2), `rating` (DECIMAL 3,1), `reviews_count`, `image`, `gallery` (JSON), `includes` (JSON), `excludes` (JSON), `itinerary` (JSON), `tags` (JSON), `featured`, `publicado`, `destination_id` (FK a destinations).
4. **`accommodations`**:
   - `id` (INT PK AI), `nombre`, `slug` (UNIQUE), `type`, `location`, `district`, `address`, `description` (TEXT), `price` (DECIMAL 10,2), `rating`, `reviews_count`, `capacity`, `rooms`, `image`, `gallery` (JSON), `amenities` (JSON), `featured`, `publicado`, `destination_id` (FK a destinations).
5. **`reservations`**:
   - `id` (INT PK AI), `codigo` (VARCHAR 20 UNIQUE, ej: `APU-XXXXXX`), `guest_nombre`, `guest_apellido`, `guest_email`, `guest_telefono`, `observaciones`, `tipo` (ENUM: `EXPERIENCIA`, `HOSPEDAJE`), `experience_id` (FK), `accommodation_id` (FK), `fecha_llegada` (DATE), `fecha_salida` (DATE), `personas` (INT), `noches` (INT), `precio_unitario` (DECIMAL), `subtotal` (DECIMAL), `service_fee` (DECIMAL), `total` (DECIMAL), `estado` (ENUM: `PENDIENTE`, `CONFIRMADA`, `CANCELADA`, `COMPLETADA`), `estado_pago` (ENUM: `SIN_PAGO`, `SIMULADO`), `user_id` (FK opcional), timestamps.

---

## 5. Guía de Puesta en Marcha

### Requisitos Previos
- Node.js ≥ 18 (verificado con Node v24.11)
- MySQL 8.0 en ejecución en el puerto 3306

### Paso 1: Configurar el Backend
```bash
cd backend
npm install
```

Crea el archivo `.env` a partir de `.env.example`:
```ini
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="mysql://root:TU_PASSWORD_MYSQL@localhost:3306/apurimac_turismo"
JWT_SECRET=tu_clave_secreta_jwt_larga_y_segura
JWT_EXPIRES_IN=7d
ADMIN_SEED_EMAIL=admin@apurimac.pe
ADMIN_SEED_PASSWORD=Admin2024!
```

### Paso 2: Crear Base de Datos, Migrar y Poblar
```bash
# 1. Empujar el esquema Prisma hacia MySQL
npm run db:push

# 2. Ejecutar el seed idempotente con datos de Apurímac
npm run seed
```

### Paso 3: Iniciar Servidores

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Servidor escuchando en http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd ecommerce-frontend
npm run dev
# Aplicación disponible en http://localhost:5173
```

---

## 6. Credenciales de Demostración

| Rol | Correo | Contraseña | Acceso |
|---|---|---|---|
| **Administrador** | `admin@apurimac.pe` | `Admin2024!` | Catálogo, Reservas, Dashboard (`/admin`) |
| **Invitado** | N/A | N/A | Navegación pública, Reserva sin cuenta |

---

## 7. Tabla de Endpoints REST (`/api/v1`)

### Rutas Públicas
| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Healthcheck y estado de la API |
| `GET` | `/destinations` | Lista de destinos turísticos |
| `GET` | `/destinations/:slug` | Detalle de destino con experiencias vinculadas |
| `GET` | `/experiences` | Catálogo de experiencias con filtros de categoría y texto |
| `GET` | `/experiences/:slug` | Detalle completo e itinerario de experiencia |
| `GET` | `/accommodations` | Catálogo de hospedajes y alojamientos |
| `GET` | `/accommodations/:slug` | Ficha técnica y servicios de hospedaje |
| `POST` | `/reservations` | Registro de reserva (calcula precios en servidor) |
| `POST` | `/auth/login` | Login con validación y emisión de JWT |

### Rutas Protegidas (JWT Bearer)
| Método | Endpoint | Rol Requerido | Descripción |
|---|---|---|---|
| `GET` | `/auth/me` | Cualquier usuario | Datos del usuario actual |
| `POST` | `/auth/logout` | Cualquier usuario | Cierre de sesión |
| `GET` | `/admin/reservations` | `ADMIN` | Listado completo de reservas |
| `GET` | `/admin/reservations/:id` | `ADMIN` | Detalle de una reserva |
| `PATCH` | `/admin/reservations/:id/estado` | `ADMIN` | Modificar estado (`CONFIRMADA`, `PENDIENTE`, `CANCELADA`) |
| `DELETE` | `/admin/reservations/:id` | `ADMIN` | Eliminar reserva en base de datos |
| `GET` | `/admin/experiences` | `ADMIN` | Listado administrativo de experiencias |
| `POST` | `/admin/experiences` | `ADMIN` | Crear nueva experiencia |
| `PUT` | `/admin/experiences/:id` | `ADMIN` | Actualizar experiencia existente |
| `DELETE` | `/admin/experiences/:id` | `ADMIN` | Eliminar experiencia |
| `PATCH` | `/admin/experiences/:id/publish` | `ADMIN` | Alternar estado publicada/oculta |
| `GET` | `/admin/accommodations` | `ADMIN` | Listado administrativo de hospedajes |
| `POST` | `/admin/accommodations` | `ADMIN` | Registrar nuevo hospedaje |
| `PUT` | `/admin/accommodations/:id` | `ADMIN` | Actualizar datos de hospedaje |
| `DELETE` | `/admin/accommodations/:id` | `ADMIN` | Eliminar hospedaje |
| `PATCH` | `/admin/accommodations/:id/publish` | `ADMIN` | Alternar estado publicado/oculto |

---

## 8. Separación Conceptual: V1 vs V2 vs V3 vs V4

- **V1 (Frontend Demo):** Interfaz en React, catálogo navegable, componentes visuales, diseño responsivo y mock data local.
- **V2 (Backend & API REST):** Servidor Node.js + Express, diseño de endpoints RESTful, desacoplamiento cliente-servidor mediante JSON, cabeceras CORS y manejo de errores.
- **V3 (Persistencia Relacional & Seguridad):** Base de datos MySQL 8.0, modelo relacional formal, ORM Prisma, hash con bcrypt, autenticación por tokens JWT, control de acceso basado en roles (`ADMIN`/`USER`), persistencia de reservas y CRUD de administración conectado.
- **V4 (Futuro / Fuera de alcance actual):** Pasarelas de pago reales (Stripe, Culqi), envío transaccional de correos (Nodemailer/SendGrid), despliegue en la nube y nombres de dominio.

---

## 9. Limitaciones y Declaración Honesta

- **Imágenes subidas:** se guardan en `backend/uploads/`, fuera de Git. Incluye esa carpeta junto con el respaldo de MySQL; una copia de la base de datos por sí sola no contiene las fotos. El almacenamiento local necesita un volumen persistente o un servicio de archivos al desplegar en la nube. Las imágenes se suben al seleccionarlas, incluso si después se cancela el formulario.

- **Pasarela de pago:** Las reservas procesadas en esta entrega simulan el pago asignando el estado inicial `PENDIENTE` y `SIN_PAGO`/`SIMULADO`, conforme al alcance de la V3 académica.
- **Entorno MySQL:** Requiere tener el servicio de MySQL 8.0 corriendo localmente con las credenciales indicadas en `.env`.
