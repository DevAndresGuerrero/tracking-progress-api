# Configuración Dinámica de Base de Datos

Este proyecto ahora soporta múltiples proveedores de base de datos que pueden ser cambiados dinámicamente usando variables de entorno y scripts automatizados.

## 🚀 Proveedores Soportados

- **SQLite** (por defecto)
- **PostgreSQL**
- **MySQL**

## 📁 Estructura de Archivos

```bash

prisma/
├── schema.prisma              # Archivo principal (cambia dinámicamente)
├── schema.sqlite.prisma       # Configuración para SQLite
├── schema.postgresql.prisma   # Configuración para PostgreSQL
├── schema.mysql.prisma        # Configuración para MySQL
└── dev.db                     # Base de datos SQLite (si se usa)

scripts/
├── setup-database.js          # Script para cambiar de provider
└── test-config.js             # Script para verificar configuración
```

## 🔧 Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Elige tu provider: sqlite, postgresql, mysql
DATABASE_PROVIDER=sqlite

# URLs para cada provider
# SQLite (por defecto)
DATABASE_URL="file:./dev.db"

# PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/tracking_progress"

# MySQL
# DATABASE_URL="mysql://username:password@localhost:3306/tracking_progress"
```

## 🎯 Cómo Cambiar de Provider

### Usando los Scripts Automatizados (Recomendado)

```bash
# Cambiar a SQLite
pnpm db:setup:sqlite

# Cambiar a PostgreSQL
pnpm db:setup:postgresql

# Cambiar a MySQL
pnpm db:setup:mysql
```

### Manualmente

1. **Copia el esquema adecuado:**

   ```bash
   # Para SQLite
   cp prisma/schema.sqlite.prisma prisma/schema.prisma

   # Para PostgreSQL
   cp prisma/schema.postgresql.prisma prisma/schema.prisma

   # Para MySQL
   cp prisma/schema.mysql.prisma prisma/schema.prisma
   ```

2. **Genera el cliente de Prisma:**

   ```bash
   pnpm db:generate
   ```

3. **Ejecuta migraciones si es necesario:**

   ```bash
   pnpm db:migrate
   ```

## 📋 Scripts Disponibles

```bash
# Scripts para cambiar de provider
pnpm db:setup:sqlite      # Configurar para SQLite
pnpm db:setup:postgresql  # Configurar para PostgreSQL
pnpm db:setup:mysql       # Configurar para MySQL

# Scripts generales de base de datos
pnpm db:migrate          # Crear y aplicar migraciones
pnpm db:push             # Empujar esquema a la base de datos
pnpm db:seed             # Ejecutar seed
pnpm db:studio           # Abrir Prisma Studio
pnpm db:generate         # Generar cliente Prisma
```

## 🔍 Diferencias entre Providers

### SQLite

- **UUID:** `String @default(uuid())`
- **DateTime:** `DateTime @default(now())`
- **Archivo:** `file:./dev.db`

### PostgreSQL

- **UUID:** `String @default(uuid()) @db.Uuid`
- **DateTime:** `DateTime @default(now()) @db.Timestamp(6)`
- **URL:** `postgresql://usuario:contraseña@localhost:5432/basedatos`

### MySQL

- **UUID:** `String @default(uuid()) @db.VarChar(36)`
- **DateTime:** `DateTime @default(now()) @db.DateTime(6)`
- **URL:** `mysql://usuario:contraseña@localhost:3306/basedatos`

## 🚀 Flujo de Trabajo Recomendado

### Para Desarrollo (SQLite)

```bash
# 1. Configurar SQLite
pnpm db:setup:sqlite

# 2. Iniciar la aplicación
pnpm start:dev
```

### Para Producción (PostgreSQL)

```bash
# 1. Configurar PostgreSQL
pnpm db:setup:postgresql

# 2. Configurar variables de entorno en producción
# 3. Ejecutar migraciones
pnpm db:migrate:deploy

# 4. Iniciar la aplicación
pnpm start:prod
```

## ⚠️ Notas Importantes

1. **Cambio de Provider:** Cuando cambies de provider, asegúrate de:
   - Actualizar la variable `DATABASE_URL` en tu `.env`
   - Tener el servidor de base de datos correspondiente corriendo
   - Ejecutar las migraciones necesarias

2. **Datos:** Cambiar de provider no migra automáticamente los datos. Necesitarás:
   - Exportar datos del provider anterior
   - Importarlos al nuevo provider
   - O ejecutar el seed nuevamente

3. **Migraciones:** Cada provider tiene su propio sistema de migraciones. Las migraciones creadas para un provider no son compatibles con otros.

## 🔍 Verificación

Para verificar que la configuración está funcionando correctamente:

```bash
# Verificar provider actual
cat prisma/schema.prisma | grep "provider ="

# Verificar que el cliente se generó correctamente
ls -la node_modules/.prisma/
```

## 🐛 Solución de Problemas

### Errores Comunes

1. **"Cannot find module"**: Ejecuta `pnpm install` para reinstalar dependencias.
2. **"Database connection failed"**: Verifica que el servidor de base de datos esté corriendo y las credenciales sean correctas.
3. **"Migration failed"**: Asegúrate de estar usando el provider correcto y que la base de datos esté vacía o compatible.

### Limpieza

Si necesitas empezar de nuevo:

```bash
# Eliminar base de datos SQLite
rm prisma/dev.db

# Resetear migraciones
rm -rf prisma/migrations

# Regenerar todo
pnpm db:setup:sqlite
```

¡Listo! Ahora puedes cambiar dinámicamente entre diferentes proveedores de base de datos según tus necesidades. 🎉
