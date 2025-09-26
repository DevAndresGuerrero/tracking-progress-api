import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

type RoleWithPermissions = {
  id: string;
  name: string;
  description: string | null;
  permissions: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleWithPermissions> {
    const { permissionIds, ...roleData } = createRoleDto;

    const role = await this.prisma.role.create({
      data: {
        ...roleData,
        rolePermissions: permissionIds
          ? {
              create: permissionIds.map((permissionId) => ({
                permission: {
                  connect: { id: permissionId },
                },
              })),
            }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }

  async findAll(): Promise<RoleWithPermissions[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    }));
  }

  async findOne(id: string): Promise<RoleWithPermissions> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Rol no encontrado");
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleWithPermissions> {
    const { permissionIds, ...roleData } = updateRoleDto;

    // Verificar si el rol existe
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException("Rol no encontrado");
    }

    // Si hay permissionIds, primero eliminar las relaciones existentes
    if (permissionIds !== undefined) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        ...roleData,
        rolePermissions: permissionIds
          ? {
              create: permissionIds.map((permissionId) => ({
                permission: {
                  connect: { id: permissionId },
                },
              })),
            }
          : undefined,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      permissions: updatedRole.rolePermissions.map((rp) => rp.permission),
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    // Verificar si el rol existe
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException("Rol no encontrado");
    }

    // Eliminar el rol (las relaciones se eliminarán en cascada)
    await this.prisma.role.delete({
      where: { id },
    });

    return { message: "Rol eliminado correctamente" };
  }

  async findByName(name: string): Promise<RoleWithPermissions | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return null;
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map((rp) => rp.permission),
    };
  }
}
