import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permiso no encontrado");
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    // Verificar si el permiso existe
    const existingPermission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      throw new NotFoundException("Permiso no encontrado");
    }

    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    // Verificar si el permiso existe
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException("Permiso no encontrado");
    }

    // Eliminar el permiso
    await this.prisma.permission.delete({
      where: { id },
    });

    return { message: "Permiso eliminado correctamente" };
  }

  async findByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }
}
