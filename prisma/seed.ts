import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear permisos
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: "activity.create" },
      update: {},
      create: {
        name: "activity.create",
        description: "Crear actividades",
      },
    }),
    prisma.permission.upsert({
      where: { name: "activity.view" },
      update: {},
      create: {
        name: "activity.view",
        description: "Ver actividades",
      },
    }),
    prisma.permission.upsert({
      where: { name: "activity.update" },
      update: {},
      create: {
        name: "activity.update",
        description: "Actualizar actividades",
      },
    }),
    prisma.permission.upsert({
      where: { name: "activity.delete" },
      update: {},
      create: {
        name: "activity.delete",
        description: "Eliminar actividades",
      },
    }),
    prisma.permission.upsert({
      where: { name: "progress.create" },
      update: {},
      create: {
        name: "progress.create",
        description: "Crear registros de progreso",
      },
    }),
    prisma.permission.upsert({
      where: { name: "progress.update" },
      update: {},
      create: {
        name: "progress.update",
        description: "Actualizar registros de progreso",
      },
    }),
    prisma.permission.upsert({
      where: { name: "progress.delete" },
      update: {},
      create: {
        name: "progress.delete",
        description: "Eliminar registros de progreso",
      },
    }),
    prisma.permission.upsert({
      where: { name: "category.manage" },
      update: {},
      create: {
        name: "category.manage",
        description: "Gestionar categorías",
      },
    }),
    prisma.permission.upsert({
      where: { name: "tag.manage" },
      update: {},
      create: {
        name: "tag.manage",
        description: "Gestionar etiquetas",
      },
    }),
    prisma.permission.upsert({
      where: { name: "user.manage" },
      update: {},
      create: {
        name: "user.manage",
        description: "Gestionar usuarios",
      },
    }),
    prisma.permission.upsert({
      where: { name: "role.manage" },
      update: {},
      create: {
        name: "role.manage",
        description: "Gestionar roles",
      },
    }),
    prisma.permission.upsert({
      where: { name: "permission.manage" },
      update: {},
      create: {
        name: "permission.manage",
        description: "Gestionar permisos",
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrador del sistema",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Usuario regular",
    },
  });

  const viewerRole = await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: {
      name: "viewer",
      description: "Usuario solo lectura",
    },
  });

  console.log("✅ Created 3 roles: admin, user, viewer");

  // Asignar permisos a roles
  // Admin: todos los permisos
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // User: permisos para gestionar sus propios recursos
  const userPermissions = permissions.filter(
    (p) => p.name.startsWith("activity.") || p.name.startsWith("progress.") || p.name === "category.manage" || p.name === "tag.manage",
  );

  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer: solo permisos de lectura
  const viewerPermissions = permissions.filter((p) => p.name.endsWith(".view"));

  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✅ Assigned permissions to roles");

  // Crear usuario admin por defecto
  // Nota: En producción deberías usar bcrypt para hashear la contraseña
  const plainPassword = "admin123"; // Temporal para desarrollo

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: plainPassword,
    },
  });

  // Asignar rol admin al usuario admin
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("✅ Created admin user (admin@example.com / admin123)");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
