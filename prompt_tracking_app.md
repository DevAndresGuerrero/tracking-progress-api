# Prompt para Windsurf — App de Tracking (NestJS + TypeScript + Prisma)

> **Contexto:** Tienes un proyecto existente en NestJS + TypeScript + Prisma. Este documento es un _prompt detallado_ (paso a paso) para que Windsurf (tu IDE/automation) genere/añada la arquitectura, módulos, schemas y artefactos iniciales necesarios para una app multiusuario de tracking (actividades, progreso, categorías, tags, roles y permisos).

---

## Objetivo del prompt

Generar en el repositorio existente todos los artefactos backend necesarios (Prisma schema, módulos NestJS, servicios, controladores, DTOs, guards y seed) para una aplicación de tracking multiusuario con roles y permisos.

---

## Stack recomendado

- NestJS (TypeScript)
- Prisma (Postgres recomendado en producción; SQLite para dev/testing opcional)
- Passport + JWT para autenticación (access token + refresh token)
- class-validator / class-transformer para validaciones
- bcrypt (hashing de contraseñas)
- Jest para tests
- ESLint + Prettier

---

## Archivos de entorno (.env) necesarios (lista)

```
DATABASE_URL=postgresql://user:pass@localhost:5432/tracking_db?schema=public
JWT_SECRET=tu_secreto_largo
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secreto
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

---

## Prisma schema (plantilla)

> Añadir el siguiente contenido en `prisma/schema.prisma` (ajusta el `datasource` según tu env):

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ActivityType {
  reading
  exercise
  task
  habit
  study
  project
  custom
}

model User {
  id         String      @id @default(uuid())
  name       String
  email      String      @unique
  password   String
  userRoles  UserRole[]
  activities Activity[]
  categories Category[]
  tags       Tag[]
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model Role {
  id              String           @id @default(uuid())
  name            String           @unique
  description     String?
  rolePermissions RolePermission[]
  userRoles       UserRole[]
}

model Permission {
  id              String           @id @default(uuid())
  name            String           @unique
  description     String?
  rolePermissions RolePermission[]
}

model RolePermission {
  id           String     @id @default(uuid())
  role         Role       @relation(fields: [roleId], references: [id])
  roleId       String
  permission   Permission @relation(fields: [permissionId], references: [id])
  permissionId String
  @@unique([roleId, permissionId])
}

model UserRole {
  id     String @id @default(uuid())
  user   User   @relation(fields: [userId], references: [id])
  userId String
  role   Role   @relation(fields: [roleId], references: [id])
  roleId String
  @@unique([userId, roleId])
}

model Category {
  id        String     @id @default(uuid())
  user      User       @relation(fields: [userId], references: [id])
  userId    String
  name      String
  color     String?
  activities Activity[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Tag {
  id        String       @id @default(uuid())
  user      User         @relation(fields: [userId], references: [id])
  userId    String
  name      String
  activities ActivityTag[]
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt
}

model Activity {
  id         String        @id @default(uuid())
  user       User          @relation(fields: [userId], references: [id])
  userId     String
  category   Category?     @relation(fields: [categoryId], references: [id])
  categoryId String?
  name       String
  type       ActivityType
  target     Float?
  unit       String?
  frequency  String?
  notes      String?
  startDate  DateTime?
  endDate    DateTime?
  progress   Progress[]
  tags       ActivityTag[]
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
}

model ActivityTag {
  id         String    @id @default(uuid())
  activity   Activity  @relation(fields: [activityId], references: [id])
  activityId String
  tag        Tag       @relation(fields: [tagId], references: [id])
  tagId      String
  @@unique([activityId, tagId])
}

model Progress {
  id         String   @id @default(uuid())
  activity   Activity @relation(fields: [activityId], references: [id])
  activityId String
  date       DateTime
  amount     Float
  notes      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model RefreshToken {
  id        String   @id @default(uuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  token     String
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

## Tareas paso a paso (TASKs) — Para que Windsurf las ejecute secuencialmente

Cada `TASK` debería ejecutarse en orden. Cada tarea incluye la ruta de archivos y un resumen de contenido.

### TASK 00 — Validación previa

- Verificar que exista `package.json` con NestJS y Prisma instalados.
- Comandos sugeridos si faltan dependencias:

  ```bash
  npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
  npm install @nestjs/passport passport passport-jwt passport-local bcrypt class-validator class-transformer
  npm install @prisma/client prisma
  npm install --save-dev typescript ts-node-dev jest @types/jest @nestjs/testing
  ```

### TASK 01 — Añadir `prisma/schema.prisma`

- Crear/actualizar `prisma/schema.prisma` con el contenido de la sección _Prisma schema_ de este prompt.
- Ejecutar:

  ```bash
  npx prisma generate
  npx prisma migrate dev --name init
  ```

### TASK 02 — Crear PrismaModule y PrismaService

**Archivos**:

- `src/prisma/prisma.module.ts`
- `src/prisma/prisma.service.ts`

**Contenido esencial (resumen)**:

- PrismaService extiende `PrismaClient` y usa `OnModuleInit` para conectar.
- PrismaModule exporta PrismaService para inyectarlo en otros módulos.

### TASK 03 — Seed inicial (roles + permisos)

**Archivo**: `prisma/seed.ts`

- Insertar roles: `admin`, `user`, `viewer`.
- Insertar permisos sugeridos: `activity.create`, `activity.view`, `activity.update`, `activity.delete`, `progress.create`, `progress.update`, `category.manage`, `tag.manage`, `user.manage`, `role.manage`, `permission.manage`.
- Relacionar permisos a roles (ej: admin todos los permisos; user permisos para administrar sus recursos; viewer solo view).

**Comando para ejecutar seed**:

```bash
npx ts-node prisma/seed.ts
```

### TASK 04 — Módulo Auth (JWT + Refresh tokens)

**Archivos**:

- `src/auth/auth.module.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.controller.ts`
- `src/auth/jwt.strategy.ts`
- `src/auth/guards/jwt-auth.guard.ts`
- `src/auth/dto/login.dto.ts`, `register.dto.ts`

**Resumen**:

- `auth.service` gestiona registro (hash password con bcrypt), login (verifica credenciales), generar accessToken y refreshToken (guardar hash de refresh en DB si se desea).
- Implementar endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.

### TASK 05 — Módulo Users

**Archivos**:

- `src/users/users.module.ts`
- `src/users/users.service.ts`
- `src/users/users.controller.ts`
- `src/users/dto/update-user.dto.ts`

**Resumen**:

- Métodos: findById, findByEmail, create, update, remove (admin only)
- `users.controller` expone `GET /users/me`, `PATCH /users/:id` (role guard), `GET /users` (admin)

### TASK 06 — Módulos Roles y Permissions

**Archivos**:

- `src/roles/roles.module.ts`, `roles.service.ts`, `roles.controller.ts`
- `src/permissions/permissions.module.ts`, `permissions.service.ts`, `permissions.controller.ts`
- `src/roles/dto/*.dto.ts`, `src/permissions/dto/*.dto.ts`

**Resumen**:

- Endpoints para CRUD de roles y permisos (admin only).
- Servicio que permita consultar permisos por rol y construir una cache opcional en memoria.

### TASK 07 — Guards y Decorators (Roles + Permissions)

**Archivos**:

- `src/common/decorators/roles.decorator.ts` (ej. `@Roles('admin')`)
- `src/common/guards/roles.guard.ts` (implementa `CanActivate`, verifica permisos/roles desde request.user)
- `src/common/decorators/permissions.decorator.ts`
- `src/common/guards/permissions.guard.ts`

**Resumen**:

- `RolesGuard` lee roles del usuario y compara con requeridos. Si la app usa permisos, `PermissionsGuard` valida permisos individuales.

### TASK 08 — Módulo Categories

**Archivos**:

- `src/categories/categories.module.ts`
- `src/categories/categories.service.ts`
- `src/categories/categories.controller.ts`
- `src/categories/dto/create-category.dto.ts` / `update-category.dto.ts`

**Resumen**:

- CRUD de categorías, propiedad del usuario (userId). Filtros: por usuario.

### TASK 09 — Módulo Tags

Similares a categories. Crear endpoints CRUD y relación con activities mediante ActivityTag.

### TASK 10 — Módulo Activities

**Archivos**:

- `src/activities/activities.module.ts`
- `src/activities/activities.service.ts`
- `src/activities/activities.controller.ts`
- DTOs: `create-activity.dto.ts`, `update-activity.dto.ts`, `query-activities.dto.ts`

**Endpoints sugeridos**:

- `GET /activities?categoryId=&type=&from=&to=&page=&limit=`
- `GET /activities/:id`
- `POST /activities` (body -> CreateActivityDto)
- `PUT /activities/:id`
- `DELETE /activities/:id`

**Lógicas internas**:

- Al crear/actualizar validar que `userId` = request.user.id (a menos que sea admin)
- Integrar tags (crear relación ActivityTag)

### TASK 11 — Módulo Progress

**Archivos**:

- `src/progress/progress.module.ts`
- `src/progress/progress.service.ts`
- `src/progress/progress.controller.ts`
- DTOs: `create-progress.dto.ts`, `update-progress.dto.ts`

**Endpoints**:

- `POST /activities/:activityId/progress` (añadir registro)
- `GET /activities/:activityId/progress?from=&to=`
- `PUT /progress/:id`
- `DELETE /progress/:id`

**Validaciones**:

- Verificar que el usuario es dueño de la activity o tiene permiso admin.

### TASK 12 — Tests iniciales (jest)

- Añadir pruebas unitarias básicas para: UsersService, AuthService, ActivitiesService.
- Estructura `src/**/*.spec.ts`.

### TASK 13 — Scripts de package.json

Añadir scripts útiles:

```json
"scripts": {
  "start": "nest start",
  "start:dev": "nest start --watch",
  "prisma:migrate": "prisma migrate dev",
  "prisma:generate": "prisma generate",
  "seed": "ts-node prisma/seed.ts",
  "test": "jest"
}
```

### TASK 14 — Documentación y OpenAPI

- Configurar `@nestjs/swagger` y añadir decoradores a controllers principales.
- Exponer Swagger en `/api` en `main.ts` solo en `development`.

### TASK 15 — CI / CD (esqueleto)

- `/.github/workflows/ci.yml` con pasos: install, build, prisma generate, test, lint.
- Opcional deploy a Vercel/Cloud Run: pasos para build y env variables.

---

## Endpoints resumen (rápido)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`
- `GET /users` (admin)
- `CRUD /roles` (admin)
- `CRUD /permissions` (admin)
- `CRUD /categories` (user)
- `CRUD /tags` (user)
- `CRUD /activities` (user)
- `POST /activities/:activityId/progress`
- `GET /activities/:activityId/progress`

---

## DTOs ejemplo (abridged)

**CreateActivityDto**

```ts
export class CreateActivityDto {
  @IsString()
  name: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsNumber()
  target?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  tags?: string[];
}
```

**CreateProgressDto**

```ts
export class CreateProgressDto {
  @IsDateString()
  date: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

---

## Ejemplo: Guard Roles (esqueleto)

En `src/common/guards/roles.guard.ts`:

```ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userRoles = (user.roles || []).map((r) => r.name);
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
```

---

## Seed sugerido (ts) — esqueleto `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", description: "Administrador con todos los permisos" },
  });
  const user = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user", description: "Usuario regular" },
  });
  const viewer = await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: { name: "viewer", description: "Solo lectura" },
  });

  const perms = [
    "activity.create",
    "activity.view",
    "activity.update",
    "activity.delete",
    "progress.create",
    "progress.update",
    "category.manage",
    "tag.manage",
    "user.manage",
    "role.manage",
    "permission.manage",
  ];

  for (const p of perms) {
    await prisma.permission.upsert({ where: { name: p }, update: {}, create: { name: p } });
  }

  // Asociar permisos a admin
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: perm.id } },
      update: {},
      create: { roleId: admin.id, permissionId: perm.id },
    });
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Recomendaciones y buenas prácticas

- Validar siempre la propiedad `userId` en los servicios para evitar escalada de privilegios.
- Cachear permisos por rol para evitar consultas repetidas a base de datos en cada request.
- Registrar eventos importantes (login, errores, operaciones críticas) con logger estructurado.
- Tratar refresh tokens como datos sensibles y guardarlos hasheados o con mecanismo de revocación.
- Hacer migraciones incrementales en vez de regenerar el schema en producción.

---

## Cómo usar este prompt en Windsurf

1. Copiar este archivo `.md` al workspace de Windsurf.
2. Configurar Windsurf para ejecutar tareas secuenciales (TASK 01 → TASK 15).
3. Para cada TASK, crear archivos y contenidos según las rutas y esqueletos indicados.
4. Ejecutar `npx prisma generate`, `npx prisma migrate dev`, y `npm run seed` cuando corresponda.

---

## ¿Qué esperar después de ejecutar todo esto?

- Un backend NestJS funcional con autenticación JWT, roles y permisos, CRUDs para actividades, categorías y progreso.
- Prisma configurado con modelos y tablas correspondientes.
- Seed con roles/permissions iniciales.
- Swagger disponible para explorar endpoints en desarrollo.

---

_Fin del prompt — si quieres que genere además archivos concretos (ej. `PrismaService`, `AuthService`, `ActivitiesController`) automáticamente, indícalo y generaré los templates de cada archivo._
