import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateProgressDto } from "./dto/create-progress.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";
import { ProgressService } from "./progress.service";

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async create(@Body() createProgressDto: CreateProgressDto, @Request() req) {
    return this.progressService.create(createProgressDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.progressService.findAll(req.user.userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    return this.progressService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateProgressDto: UpdateProgressDto, @Request() req) {
    return this.progressService.update(id, updateProgressDto, req.user.userId);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req) {
    return this.progressService.remove(id, req.user.userId);
  }
}
