import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>("permissions", context.getHandler());

    if (!requiredPermissions) {
      return true; // Si no se requieren permisos, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Obtener los permisos del usuario desde la base de datos
    const userWithPermissions = await this.prisma.user.findUnique({
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

    if (!userWithPermissions) {
      return false;
    }

    const userPermissions = userWithPermissions.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name));

    return requiredPermissions.some((permission) => userPermissions.includes(permission));
  }
}
