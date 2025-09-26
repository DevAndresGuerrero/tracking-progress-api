import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PermissionsGuard } from "./guards/permissions.guard";
import { RbacGuard } from "./guards/rbac.guard";
import { RolesGuard } from "./guards/roles.guard";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "default-secret",
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, PermissionsGuard, RbacGuard],
  exports: [AuthService, RolesGuard, PermissionsGuard, RbacGuard],
})
export class AuthModule {}
