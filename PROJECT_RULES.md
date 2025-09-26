# Project Rules & Context - Tracking Progress API

## Project Overview

**Nombre**: Tracking Progress API
**Tecnología**: NestJS + TypeScript + Prisma
**Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo opcional)
**Arquitectura**: Multiusuario con roles y permisos

## Stack Tecnológico

- **Backend**: NestJS (TypeScript)
- **ORM**: Prisma
- **Autenticación**: Passport + JWT (access token + refresh token)
- **Validación**: class-validator / class-transformer
- **Seguridad**: bcrypt para hashing de contraseñas
- **Testing**: Jest
- **Calidad**: ESLint + Prettier

## Variables de Entorno Requeridas

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/tracking_db?schema=public
JWT_SECRET=tu_secreto_largo
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secreto
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

## Estructura de Base de Datos (Modelos Principales)

### Usuarios y Autenticación

- **User**: Usuarios del sistema
- **Role**: Roles (admin, user, viewer)
- **Permission**: Permisos del sistema
- **UserRole**: Relación muchos a muchos entre usuarios y roles
- **RolePermission**: Relación muchos a muchos entre roles y permisos
- **RefreshToken**: Tokens de refresco para JWT

### Dominio de Tracking

- **Activity**: Actividades a trackear (lectura, ejercicio, tareas, etc.)
- **Category**: Categorías personalizadas por usuario
- **Tag**: Etiquetas para organizar actividades
- **ActivityTag**: Relación muchos a muchos entre actividades y tags
- **Progress**: Registros de progreso por actividad

## Módulos del Sistema

### Módulos Principales

1. **PrismaModule**: Conexión a base de datos
2. **AuthModule**: Autenticación JWT + refresh tokens
3. **UsersModule**: Gestión de usuarios
4. **RolesModule**: Gestión de roles
5. **PermissionsModule**: Gestión de permisos
6. **CategoriesModule**: Gestión de categorías
7. **TagsModule**: Gestión de etiquetas
8. **ActivitiesModule**: Gestión de actividades
9. **ProgressModule**: Gestión de progreso

### Guards y Decorators

- **RolesGuard**: Validación de roles por endpoint
- **PermissionsGuard**: Validación de permisos por endpoint
- **@Roles()**: Decorador para requerir roles específicos
- **@Permissions()**: Decorador para requerir permisos específicos

## Endpoints Principales

### Autenticación

- `POST /auth/register` - Registro de usuarios
- `POST /auth/login` - Inicio de sesión
- `POST /auth/refresh` - Refrescar token
- `POST /auth/logout` - Cerrar sesión

### Usuarios

- `GET /users/me` - Obtener usuario actual
- `GET /users` - Listar usuarios (admin)
- `PATCH /users/:id` - Actualizar usuario (admin)

### Roles y Permisos (Admin)

- `CRUD /roles` - Gestión de roles
- `CRUD /permissions` - Gestión de permisos

### Categorías

- `CRUD /categories` - Gestión de categorías (por usuario)

### Tags

- `CRUD /tags` - Gestión de etiquetas (por usuario)

### Actividades

- `GET /activities` - Listar actividades con filtros
- `GET /activities/:id` - Obtener actividad específica
- `POST /activities` - Crear actividad
- `PUT /activities/:id` - Actualizar actividad
- `DELETE /activities/:id` - Eliminar actividad

### Progreso

- `POST /activities/:activityId/progress` - Añadir registro de progreso
- `GET /activities/:activityId/progress` - Listar progreso de actividad
- `PUT /progress/:id` - Actualizar registro de progreso
- `DELETE /progress/:id` - Eliminar registro de progreso

## Reglas de Negocio

### Seguridad

1. **Autenticación**: Todos los endpoints (excepto register/login) requieren JWT válido
2. **Autorización**:
   - Los usuarios solo pueden acceder a sus propios recursos (categories, tags, activities, progress)
   - Los admins pueden acceder a todos los recursos
   - Los viewers solo tienen permisos de lectura
3. **Validación**: Todos los DTOs usan class-validator para validación

### Datos

1. **Ownership**: Todos los recursos (categories, tags, activities) pertenecen a un usuario específico
2. **Relaciones**:
   - Activities pueden tener una Category y múltiples Tags
   - Activities tienen múltiples registros de Progress
3. **Enums**: ActivityType define tipos predefinidos de actividades

## Scripts de Desarrollo

```json
{
  "start": "nest start",
  "start:dev": "nest start --watch",
  "prisma:migrate": "prisma migrate dev",
  "prisma:generate": "prisma generate",
  "seed": "ts-node prisma/seed.ts",
  "test": "jest"
}
```

## Tareas Secuenciales de Implementación

1. **TASK 00**: Validar dependencias
2. **TASK 01**: Configurar Prisma schema
3. **TASK 02**: Crear PrismaModule y PrismaService
4. **TASK 03**: Crear seed inicial (roles + permisos)
5. **TASK 04**: Implementar AuthModule
6. **TASK 05**: Implementar UsersModule
7. **TASK 06**: Implementar Roles y Permissions modules
8. **TASK 07**: Implementar Guards y Decorators
9. **TASK 08**: Implementar CategoriesModule
10. **TASK 09**: Implementar TagsModule
11. **TASK 10**: Implementar ActivitiesModule
12. **TASK 11**: Implementar ProgressModule
13. **TASK 12**: Crear tests iniciales
14. **TASK 13**: Configurar scripts de package.json
15. **TASK 14**: Configurar documentación OpenAPI
16. **TASK 15**: Configurar CI/CD básico

## Convenciones de Código

### Estructura de Archivos

```bash
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.service.ts
│   ├── module-name.controller.ts
│   └── dto/
│       ├── create-module-name.dto.ts
│       └── update-module-name.dto.ts
├── common/
│   ├── decorators/
│   └── guards/
└── prisma/
    ├── prisma.module.ts
    └── prisma.service.ts
```

### Nomenclatura

- **Clases**: PascalCase (AuthService, CreateUserDto)
- **Variables**: camelCase (userId, isActive)
- **Archivos**: kebab-case (auth.service.ts, create-user.dto.ts)
- **Endpoints**: kebab-case (/users/me, /activities/:id)

### Patrones

- **Services**: Inyectan PrismaService para acceso a datos
- **Controllers**: Usan decorators de Swagger para documentación
- **DTOs**: Heredan de clases base cuando es posible
- **Guards**: Implementan CanActivate para validación

## Notas Importantes

1. **Seed Inicial**: Debe crear roles (admin, user, viewer) y permisos básicos
2. **JWT Strategy**: Implementar tanto access token como refresh token
3. **Validaciones**: Todos los endpoints deben validar datos de entrada
4. **Error Handling**: Usar excepciones de NestJS con códigos HTTP apropiados
5. **Testing**: Crear tests unitarios para servicios principales
6. **Documentación**: Usar @nestjs/swagger para documentación automática

## Próximos Pasos

1. Verificar estado actual del proyecto
2. Comenzar implementación secuencial de tareas
3. Validar cada módulo antes de continuar con el siguiente
4. Configurar entorno de desarrollo y base de datos
5. Implementar tests y documentación
