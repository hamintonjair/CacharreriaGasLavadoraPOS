# CacharreriaGasPOS

Sistema de Punto de Venta (POS) especializado para negocios de gas y cacharrería con gestión completa de inventario, ventas y reportes.

## Características Principales

# CacharreriaGasPOS

Sistema de Punto de Venta (POS) especializado para negocios de gas y cacharrería con gestión completa de inventario, ventas, alquileres y reportes.

## 🎯 Características Principales

### 🏪 Sistema POS Completo
- 🏪 **Sistema POS completo** para gestión de ventas
- ⛽ **Gestión especializada de gas** con control de cilindros llenos/vacíos
- 📦 **Control de inventario** con alertas de stock mínimo
- 👥 **Gestión de clientes** con historial de compras
- 📊 **Reportes y análisis** con exportación a Excel
- 🔐 **Sistema de usuarios** con roles (ADMIN/VENDEDOR)
- 💳 **Múltiples métodos de pago** (Efectivo, Nequi, Tarjeta, Transferencia)
- 🏭 **Control de envases** (cascos) en transacciones de gas

### 🧺 Gestión de Alquileres (NUEVO)
- 🧺 **Alquileres por hora**: Sistema tradicional con cálculo por horas
- 🌙 **Alquileres por amanecida**: Precio base + adicional personalizado
- ⏰ **Extensión flexible**: Extender alquileres por hora o amanecida
- 🔒 **Protección de datos**: Mantenimiento del tipo original de alquiler
- 💰 **Cálculo automático**: Precios calculados según tipo y extensión
- 🎨 **Modal mejorado**: Interfaz intuitiva con selector de tipo de extensión
- ✏️ **Campos editables**: Permiten borrar y modificar valores

### 📅 Sistema de Recordatorios y Alertas
- ⏰ **Recordatorios automáticos** para pagos y devoluciones
- 🚨 **Alertas visuales** para cuotas vencidas y por vencer
- 💬 **Notificaciones WhatsApp** automáticas
- 📊 **Análisis de ventas** con gráficos y estadísticas
- 📱 **Integración completa** con WhatsApp para contacto directo

### 💰 Gestión de Cuentas por Cobrar
- 📄 **Paginación mejorada**: Selector de items por página (10, 25, 50, 100)
- 🔢 **Navegación avanzada**: Números de página con ellipsis
- 🔍 **Filtros dinámicos**: Por cliente, rango de fechas
- ⚠️ **Alertas inteligentes**: Vencidas y por vencer con colores diferenciados
- 💸 **Procesamiento de pagos**: Múltiples cuotas simultáneas

## Arquitectura

### Frontend (`client/`)
- **Tecnología**: React + Vite + Tailwind CSS
- **Componentes**: Layout reutilizable, sistema de notificaciones
- **Páginas**: Dashboard, POS, Inventario, Clientes, Reportes, Usuarios, Categorías, Empresa
- **Gráficos**: Chart.js para visualización de datos
- **Exportación**: xlsx para generación de reportes

### Backend (`server/`)
- **API REST**: Node.js + Express
- **Base de datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT con bcryptjs
- **Uploads**: Multer para manejo de archivos
- **Reportes**: exceljs para generación de documentos

## Modelo de Datos

- **User**: Administración de usuarios y roles
- **Client**: Gestión de clientes con identificación
- **Category**: Categorías de productos
- **Product**: Inventario general con control de stock
- **GasType**: Gestión de tipos de gas (cilindros llenos/vacíos)
- **Sale/SaleItem**: Sistema de ventas flexible
- **Company**: Configuración de datos de la empresa

## 🎯 Sistema de Recordatorios y Alertas

### Recordatorios de Pagos (AccountsReceivable)
- ⏰ **Alertas automáticas** 2 días antes del vencimiento de cuotas
- 🚨 **Badges visuales** en tabla de deudas:
  - ⚠️ **Rojo**: Cuotas vencidas
  - ⏰ **Amarillo**: Cuotas por vencer (3 días)
- 💬 **WhatsApp automático** con mensaje personalizado
- ✅ **Marcar como notificado** para gestión de seguimiento

### Recordatorios de Alquileres (WashingMachines)
- 🚚 **Alertas de devolución** 20 minutos antes
- 🔴 **Alquileres vencidos** visibles hasta ser devueltos
- 📱 **Notificaciones WhatsApp** para clientes
- ✅ **Botón "Devuelto"** para actualizar estado automáticamente

### Características Técnicas
- 🔄 **Actualización automática** cada 60 segundos
- 🎨 **Diseño diferenciado** por estado (vencido/próximo)
- 📊 **Dashboard informativo** con estadísticas
- 🔔 **Sistema de notificaciones** integrado

## Requisitos

- Node.js 18+
- PostgreSQL 13+
- Navegador web moderno

## Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd CacharreriaGasPOS
   ```

2. **Configurar variables de entorno**
   ```bash
   cp server/.env.example server/.env
   # Editar server/.env con tus credenciales de base de datos
   ```

3. **Instalar dependencias**
   ```bash
   # Frontend
   cd client && npm install
   
   # Backend
   cd server && npm install
   ```

4. **Configurar base de datos**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

   **📝 Datos iniciales creados automáticamente:**
   - **Usuario Admin**: `admin` / `admin123` (rol: ADMIN)
   - **Cliente Genérico**: "Cliente Genérico" para ventas rápidas
   - **Categorías**: "Cacharrería General" y "Gas"
   - **Tipos de Gas**: Cilindros 10lb, 40lb, 100lb con stock inicial
   - **Productos**: 6 productos de ejemplo en cacharrería

5. **Ejecutar aplicación**
   ```bash
   # Backend (terminal 1)
   cd server && npm run dev
   
   # Frontend (terminal 2)
   cd client && npm run dev
   ```

## Stack Tecnológico

### Frontend
- React 18.3.1
- Vite 5.4.8
- Tailwind CSS 3.4.13
- Chart.js 4.5.1
- Lucide React 0.554.0
- xlsx 0.18.5

### Backend
- Node.js + Express
- Prisma ORM 5.19.2
- PostgreSQL
- JWT + bcryptjs
- Multer 2.0.2
- exceljs 4.4.0
- Cloudinary (gestión de logos permanentes)


## 🖼️ Gestión de Logos con Cloudinary

### 🔥 Configuración de Cloudinary para Logos Permanentes

El sistema utiliza **Cloudinary** para almacenar permanentemente los logos de la empresa, garantizando que no se pierdan entre despliegues.

**📋 Ventajas de Cloudinary:**
- ✅ **Logo permanente** - Nunca se pierde en deploys
- ✅ **URL estable** - Siempre la misma URL
- ✅ **Optimización automática** - Cloudinary optimiza imágenes
- ✅ **CDN global** - Rápido acceso mundial
- ✅ **Backup automático** - Múltiples copias de seguridad

### 🔧 Configuración Paso a Paso

**1. Crear cuenta Cloudinary:**
```bash
# Visita https://cloudinary.com y regístrate
# Obtén tus credenciales del Dashboard
```

**2. Configurar variables de entorno:**
```env
# En Render (Environment Variables)
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

**3. Instalar dependencias:**
```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

**4. Configuración automática:**
- El sistema configura Cloudinary automáticamente
- Los logos se suben a la carpeta `company2-logos`
- Cada nuevo logo sobrescribe el anterior
- La URL se guarda en la base de datos

### 🚀 Flujo de Logo en Cloudinary

**Proceso completo:**
```javascript
// 1. Usuario sube logo → Cloudinary
// 2. Cloudinary devuelve URL permanente
// 3. URL se guarda en base de datos
// 4. Logo se muestra desde Cloudinary
// 5. Logo persiste entre deploys
```

**URL típica generada:**
```
https://res.cloudinary.com/tu_cloud_name/image/upload/v1234567890/company2-logos/company2-logo.jpg
```

### 📁 Estructura en Cloudinary

```
Cloudinary Media Library:
├── company2-logos/          # Carpeta automática
│   └── company2-logo.jpg    # Logo de la empresa
└── (otros archivos si los hay)
```

### 🔍 Gestión del Logo

**Subir nuevo logo:**
1. Ve a **Configuración → Empresa** en la aplicación
2. Haz clic en **"Cambiar Logo"**
3. Selecciona archivo (JPG/PNG, máx 2MB)
4. Logo se sube automáticamente a Cloudinary
5. Nuevo logo reemplaza al anterior

**Ver logo en Cloudinary:**
1. Ingresa a `https://cloudinary.com/console`
2. Ve a **Media Library**
3. Navega a la carpeta `company2-logos`
4. Verás tu logo con opciones de transformación

### ⚙️ Configuración Técnica

**Configuración en el backend:**
```javascript
// server/routes/api.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'company2-logos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: 'company2-logo',
    overwrite: true,
    resource_type: 'image'
  }
});
```

**Visualización en frontend:**
```javascript
// Logo se muestra directamente desde Cloudinary
<img src={company.logo_url} alt="Logo de la empresa" />
```

### 🚨 Solución de Problemas

**Logo no se muestra:**
- ✅ Verifica variables de entorno en Render
- ✅ Confirma cuenta Cloudinary activa
- ✅ Revisa URL en base de datos

**Error al subir logo:**
- ✅ Verifica formato (JPG/PNG)
- ✅ Confirma tamaño (< 2MB)
- ✅ Revisa API keys de Cloudinary

### 📋 Comparación: Antes vs Después

| Característica | Antes (Local) | Después (Cloudinary) |
|---------------|----------------|---------------------|
| **Persistencia** | ❌ Se pierde en deploys | ✅ Permanente |
| **URL** | ❌ Variable local | ✅ URL estable |
| **Acceso** | ❌ Solo local | ✅ CDN global |
| **Backup** | ❌ Sin backup | ✅ Automático |
| **Optimización** | ❌ Manual | ✅ Automática |

### 🎯 Mejores Prácticas

**Recomendaciones:**
- ✅ Usar imágenes cuadradas para mejor visualización
- ✅ Optimizar logo antes de subir (menos de 500KB)
- ✅ Mantener copia de seguridad del logo original
- ✅ Usar formato PNG para logos con transparencia
- ✅ Verificar que el logo sea legible en tamaño pequeño

## Scripts Útiles

```bash
# Backend
npm run dev          # Servidor en desarrollo
npm run start        # Servidor en producción
npm run prisma:studio # Interfaz de base de datos
npm run prisma:migrate # Migraciones
npm run seed         # Poblar base de datos

# Frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Previsualizar build
```

## Estructura de Archivos

```
CacharreriaGasPOS/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   └── utils/         # Utilidades
│   └── dist/              # Build de producción
├── server/                # Backend Node.js
│   ├── prisma/           # Esquema y migraciones
│   ├── routes/           # Rutas API
│   ├── middleware/       # Middleware personalizado
│   └── public/           # Archivos estáticos
└── respaldo.sql          # Respaldo de base de datos
```

## Funcionalidades del Sistema

### Gestión de Gas
- Control de stock de cilindros llenos y vacíos
- Registro de envases entregados por clientes
- Precios diferenciados para líquido y envase

### Punto de Venta
- Interfaz intuitiva para ventas rápidas
- Soporte para productos y gas en misma venta
- Cálculo automático de totales e impuestos

### Reportes
- Ventas por período
- Análisis de productos más vendidos
- Control de inventario
- Exportación a Excel

## Licencia

Proyecto desarrollado para gestión de negocios de gas y cacharrería.

---

## 🚀 Despliegue en Render

### Requisitos Previos
- Cuenta en [Render](https://render.com/)
- Repositorio en GitHub con el código del proyecto

### Pasos para Despliegue

1. **Preparar el Repositorio**
   ```bash
   git add .
   git commit -m "Configuración para despliegue en Render"
   git push origin main
   ```

2. **Configurar en Render**
   - Ve a [Render Dashboard](https://dashboard.render.com/)
   - Click "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el archivo `render.yaml`

3. **Configuración Automática**
   El archivo `render.yaml` creará:
   - **Backend API**: `cacharreriagaspos-api`
   - **Frontend**: `cacharreriagaspos-frontend`  
   - **Base de datos**: `cacharreria-db` (PostgreSQL)

4. **Variables de Entorno**
   Render configurará automáticamente:
   - `DATABASE_URL`: Conexión a PostgreSQL
   - `JWT_SECRET`: Token secreto para autenticación
   - `VITE_API_URL`: URL del backend para el frontend

---

## 🗄️ CONFIGURACIÓN CON SUPABASE

### **¿POR QUÉ SUPABASE?**
- ✅ **Panel visual** para ver y editar datos
- ✅ **Gratis para empezar** (500MB, 50MB BW)
- ✅ **API REST automática** incluida
- ✅ **Backups automáticos** en plan gratuito
- ✅ **Más fácil** que PostgreSQL estándar

### **PASO 1: CREAR PROYECTO SUPABASE**

1. **Ve a** [Supabase](https://supabase.com)
2. **Crea cuenta gratuita**
3. **Nuevo proyecto** → Elige región cercana
4. **Espera creación** (2-3 minutos)

### **PASO 2: OBTENER CREDENCIALES**

**En tu proyecto Supabase:**
1. **Settings → Database**
2. **Copia las URLs:**

```
# Para conexión normal (con pooler)
DATABASE_URL=postgresql://postgres.oiismmsfqnfwtmufxavv:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Para migraciones (directa)
DIRECT_URL=postgresql://postgres.oiismmsfqnfwtmufxavv:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### **PASO 3: CONFIGURACIÓN LOCAL**

**1. Instala Supabase CLI:**
```bash
npm install -g supabase
# O usa npx: npx supabase
```

**2. Login en Supabase:**
```bash
npx supabase login
# Abre navegador → Autoriza
```

**3. Conecta proyecto:**
```bash
cd server
npx supabase link --project-ref TU_PROJECT_REF
```

**4. Migra las tablas:**
```bash
npx prisma db push
```

### **PASO 4: CONFIGURACIÓN EN RENDER**

**En Render Dashboard → Environment Variables:**

```
DATABASE_URL=postgresql://postgres.oiismmsfqnfwtmufxavv:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.oiismmsfqnfwtmufxavv:TU_PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=tu_secreto_aqui
```

### **PASO 5: COMANDOS DE DESPLIEGUE CON SUPABASE**

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma db seed && npm start
```

### **🔍 VERIFICACIÓN EN SUPABASE**

**Para confirmar que todo funciona:**

**1. Panel Supabase → Table Editor**
- Verás tablas: users, clients, products, etc.
- Puedes editar datos directamente

**2. SQL Editor (para consulta directa):**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**3. Prisma Studio (local):**
```bash
cd server
npx prisma studio
```

### **🚀 VENTAJAS DE SUPABASE**

- ✅ **Visualización inmediata** de datos
- ✅ **Edición directa** en el panel
- ✅ **Logs en tiempo real**
- ✅ **Backups automáticos**
- ✅ **Escalable** cuando crezcas
- ✅ **Sin configuración** de servidor PostgreSQL

### **📋 FLUJO COMPLETO**

1. **Local:** `npx prisma db push` (crea tablas)
2. **Render:** Configura variables de entorno
3. **Deploy:** Build y Start automáticos
4. **Verificación:** Panel Supabase + Login app

---

5. **Health Checks**
   - Backend: `/api/health` endpoint
   - Frontend: Servido como sitio estático

### ⚠️ CONFIGURACIÓN IMPORTANTE DE BUILD Y START RENDER

#### **PRIMERA VEZ (construcción inicial):**

**Build Command (solo primera vez):**
```bash
npm install && npx prisma generate && npx prisma db push --force-reset && npx prisma db seed && npm run build
```

**Start Command (solo primera vez):**
```bash
npx prisma db push && npx prisma db seed && npm start
```

#### **DESPUÉS DE LA PRIMERA VEZ (producción):**

**Build Command (producción):**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command (producción):**
```bash
npm start
```

#### **🚨 ¿POR QUÉ ESTE CAMBIO?**

- **Primera vez:** `--force-reset` y `seed` crean la base de datos y datos iniciales
- **Producción:** Sin `--force-reset` ni `seed` para **no perder datos existentes**
- **Mantener:** Ventas, clientes, stock real y configuración entre deploys

#### **📋 NOTAS IMPORTANTES:**
- **NO usar `--force-reset` en producción** (borra todos los datos)
- **NO ejecutar `seed` automáticamente** (resetea stock a valores iniciales)
- **Solo ejecutar `seed` manualmente** si necesitas reiniciar datos completamente

### Estructura de Despliegue

```
Render Services:
├── cacharreriagaspos-api (Node.js)
│   ├── Build: npm install + prisma generate + migrate
│   ├── Start: npm start
│   └── Port: 5000
├── cacharreriagaspos-frontend (Static)
│   ├── Build: npm install + npm run build
│   ├── Publish: dist/
│   └── Routes: API proxy al backend
└── cacharreria-db (PostgreSQL)
    └── Plan: Free (hasta 90 días)
```

### URLs de Producción
Una vez desplegado:
- **Frontend**: `https://cacharreriagaspos-frontend.onrender.com`
- **Backend API**: `https://cacharreriagaspos-api.onrender.com`
- **Base de datos**: Acceso interno desde el backend

### Acceso Inicial
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Notas Importantes
- El plan gratuito de Render tiene límites de uso
- La base de datos free se detiene después de 90 días de inactividad
- Los servicios pueden tardar 30 segundos en iniciarse (cold start)
- Para producción, considera planes pagados para mejor rendimiento

npx prisma db push && npx prisma db seed && npm start
