import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
    const requiredPermissions = this.reflector.get<string[]>("permissions", context.getHandler());

    // Si no se requieren ni roles ni permisos, permitir acceso
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Obtener los roles y permisos del usuario desde la base de datos
    const userWithRbac = await this.prisma.user.findUnique({
      where: { id: user.userId },
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

    if (!userWithRbac) {
      return false;
    }

    const userRoles = userWithRbac.userRoles.map((ur) => ur.role.name);
    const userPermissions = userWithRbac.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name));

    // Verificar roles
    if (requiredRoles) {
      const hasRequiredRoles = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRequiredRoles) {
        return false;
      }
    }

    // Verificar permisos
    if (requiredPermissions) {
      const hasRequiredPermissions = requiredPermissions.some((permission) => userPermissions.includes(permission));
      if (!hasRequiredPermissions) {
        return false;
      }
    }

    return true;
  }
}
