import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Controller("activities")
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  async create(@Body() createActivityDto: CreateActivityDto, @Request() req) {
    return this.activitiesService.create(createActivityDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.activitiesService.findAll(req.user.userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    return this.activitiesService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateActivityDto: UpdateActivityDto, @Request() req) {
    return this.activitiesService.update(id, updateActivityDto, req.user.userId);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req) {
    return this.activitiesService.remove(id, req.user.userId);
  }
}
