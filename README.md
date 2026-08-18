# CacharreriaGasPOS

Sistema de Punto de Venta (POS) especializado para negocios de gas y cacharrería con gestión completa de inventario, ventas, alquileres y reportes.

## 🎯 Características Principales

### 🏪 Sistema POS Completo
- 🏪 **Sistema POS completo** para gestión de ventas.
- ⛽ **Gestión especializada de gas** con control de cilindros llenos/vacíos.
- 📦 **Control de inventario** con alertas de stock mínimo.
- 👥 **Gestión de clientes** con historial de compras.
- 📊 **Reportes y análisis** con exportación a Excel.
- 🔐 **Sistema de usuarios** con roles (ADMIN/VENDEDOR).
- 💳 **Múltiples métodos de pago** (Efectivo, Nequi, Tarjeta, Transferencia, Crédito).
- 🏭 **Control de envases** (cascos) en transacciones de gas.

### 🧺 Gestión de Alquileres
- 🧺 **Alquileres por hora**: Sistema tradicional con cálculo por horas.
- 🌙 **Alquileres por amanecida**: Precio base + adicional personalizado.
- ⏰ **Extensión flexible**: Extender alquileres por hora o amanecida.
- 💰 **Cálculo automático**: Precios calculados según tipo y extensión.
- 🚚 **Devoluciones ágiles**: Marcar como devueltas con un clic.

### 📅 Sistema de Recordatorios y Alertas
- ⏰ **Recordatorios automáticos** para pagos de crédito y devoluciones de alquiler.
- 🚨 **Alertas visuales** para cuotas vencidas y por vencer.
- 💬 **Notificaciones WhatsApp** automáticas.

### 💰 Gestión de Cuentas por Cobrar (Cartera)
- 📄 **Paginación mejorada**: Selector de items por página.
- 🔍 **Filtros dinámicos**: Por cliente y rango de fechas.
- ⚠️ **Alertas inteligentes**: Vencidas y por vencer con colores diferenciados.
- 💸 **Procesamiento de pagos**: Múltiples cuotas simultáneas con abonos.

### 📈 Dashboard Analítico
- **KPIs en tiempo real**: Ventas del día, inventario crítico, cartera por cobrar y lavadoras alquiladas.
- **Gráficos interactivos**: Distribución de métodos de pago y tendencia de ventas (Chart.js).
- **Filtros de fechas**: Visualiza estadísticas por rangos de fechas personalizables.

## 🏢 Configuración de la Empresa
El sistema permite configurar los datos de tu empresa (Nombre, NIT, Teléfono, Dirección) y subir un **Logotipo**. 
* **Almacenamiento Local:** Las imágenes del logotipo se almacenan de forma segura en el directorio del servidor (`/public/uploads/logos`).
* **Optimización en disco:** Al subir un logo nuevo, el sistema detecta y elimina automáticamente el logo anterior para evitar acumulación de archivos innecesarios.
* **Integración Global:** Este logotipo se refleja en los formatos de facturas (PDF y tickets), recibos de pago y comprobantes de alquiler.

## Arquitectura

### Frontend (`client/`)
- **Tecnología**: React + Vite + Tailwind CSS.
- **Gráficos**: Chart.js.
- **Exportación**: xlsx.

### Backend (`server/`)
- **API REST**: Node.js + Express.
- **Base de datos**: PostgreSQL con Prisma ORM.
- **Autenticación**: JWT con bcryptjs.
- **Manejo de Archivos**: Multer (almacenamiento local para logos).

## Instalación y Configuración (Local)

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd CacharreriaGasPOS
   ```

2. **Configurar variables de entorno**
   Copia el archivo `server/.env.example` a `server/.env` y configura tu conexión a la base de datos PostgreSQL.

3. **Instalar dependencias**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

4. **Configurar base de datos (Prisma)**
   ```bash
   cd server
   npx prisma db push
   npx prisma db seed
   ```
   **Datos iniciales generados:**
   - Usuario: `admin` / `admin123`

5. **Ejecutar aplicación en Desarrollo**
   ```bash
   # En server/
   npm run dev
   # En client/
   npm run dev
   ```

## 🗄️ Configuración con Supabase (Recomendado para Producción)

Supabase es ideal como base de datos PostgreSQL en la nube para este proyecto.
1. Crea un proyecto en [Supabase](https://supabase.com).
2. Obtén la URL de conexión (Transaction Pooler) y la URL Directa (Session).
3. En tu archivo `.env` del servidor, o en las variables de entorno de tu servicio de hosting (ej. Render), configura:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="tu_jwt_secret_super_seguro"
   ```
4. Aplica los cambios a Supabase ejecutando `npx prisma db push` desde tu máquina local.

## 🚀 Despliegue

La aplicación está optimizada para ser desplegada como un entorno **Full-Stack integrado**:
1. El backend (`server.js`) sirve la API en `/api/*`.
2. El frontend de React se compila mediante Vite y los archivos estáticos son servidos por Express en la raíz `/`.
3. Al ejecutar `npm run build` en la raíz, compilará todo listo para iniciar con `npm start`.

---
*CacharreriaGasPOS - Proyecto desarrollado para la gestión eficiente de negocios de venta de productos, distribución de gas y alquileres.*