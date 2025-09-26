import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { User } from "@prisma/client";
// import * as bcrypt from "bcrypt"; // Temporalmente deshabilitado
import { PrismaService } from "../prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

type UserWithRoles = User & {
  userRoles: Array<{
    role: {
      name: string;
      description: string | null;
      rolePermissions: Array<{
        permission: {
          name: string;
          description: string | null;
        };
      }>;
    };
  }>;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserWithRoles> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserWithRoles | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async create(userData: { name: string; email: string; password: string }): Promise<User> {
    // const hashedPassword = await bcrypt.hash(userData.password, 10);
    const hashedPassword = userData.password; // ⚠️ SOLO PARA DESARROLLO

    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, requestingUserId?: string): Promise<UserWithRoles> {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // Si no es el mismo usuario, verificar si es admin
    if (requestingUserId && requestingUserId !== id) {
      const requestingUser = await this.findById(requestingUserId);
      const isAdmin = requestingUser.userRoles.some((ur) => ur.role.name === "admin");

      if (!isAdmin) {
        throw new UnauthorizedException("No tienes permiso para actualizar este usuario");
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<User> = {};

    if (updateUserDto.name) {
      updateData.name = updateUserDto.name;
    }

    if (updateUserDto.email) {
      // Verificar si el email ya está en uso por otro usuario
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new UnauthorizedException("El email ya está en uso");
      }

      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      // updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      updateData.password = updateUserDto.password; // ⚠️ SOLO PARA DESARROLLO
    }

    // Actualizar el usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedUser;
  }

  async remove(id: string, requestingUserId?: string): Promise<{ message: string }> {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    // Si no es el mismo usuario, verificar si es admin
    if (requestingUserId && requestingUserId !== id) {
      const requestingUser = await this.findById(requestingUserId);
      const isAdmin = requestingUser.userRoles.some((ur) => ur.role.name === "admin");

      if (!isAdmin) {
        throw new UnauthorizedException("No tienes permiso para eliminar este usuario");
      }
    }

    // Eliminar el usuario (las relaciones se eliminarán en cascada)
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: "Usuario eliminado exitosamente" };
  }

  async findAll(requestingUserId?: string): Promise<
    Array<{
      id: string;
      name: string;
      email: string;
      createdAt: Date;
      userRoles: Array<{
        role: {
          name: string;
          description: string | null;
        };
      }>;
    }>
  > {
    // Si hay un requestingUserId, verificar si es admin
    if (requestingUserId) {
      const requestingUser = await this.findById(requestingUserId);
      const isAdmin = requestingUser.userRoles.some((ur) => ur.role.name === "admin");

      if (!isAdmin) {
        throw new UnauthorizedException("No tienes permiso para ver todos los usuarios");
      }
    }

    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }
}
