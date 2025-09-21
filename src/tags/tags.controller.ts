import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { TagsService } from "./tags.service";

@Controller("tags")
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto, @Request() req) {
    return this.tagsService.create(createTagDto, req.user.userId);
  }

  @Get()
  async findAll(@Request() req) {
    return this.tagsService.findAll(req.user.userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    return this.tagsService.findOne(id, req.user.userId);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateTagDto: UpdateTagDto, @Request() req) {
    return this.tagsService.update(id, updateTagDto, req.user.userId);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req) {
    return this.tagsService.remove(id, req.user.userId);
  }
}
