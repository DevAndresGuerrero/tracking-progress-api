import { Body, Controller, Delete, Get, Param, Patch, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
      permissions: user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.name)),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    return this.usersService.update(id, updateUserDto, req.user.userId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async removeUser(@Param("id") id: string, @Request() req) {
    return this.usersService.remove(id, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user.userId);
  }
}
