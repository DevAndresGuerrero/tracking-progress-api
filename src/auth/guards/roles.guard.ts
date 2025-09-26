import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());

    if (!requiredRoles) {
      return true; // Si no se requieren roles, permitir acceso
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Obtener los roles del usuario desde la base de datos
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    const userRoles = userWithRoles.userRoles.map((ur) => ur.role.name);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
