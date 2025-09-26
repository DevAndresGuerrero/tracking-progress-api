import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto, userId: string) {
    return this.prisma.tag.create({
      data: {
        ...createTagDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException("Tag no encontrado");
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto, userId: string) {
    // Verificar si el tag existe y pertenece al usuario
    const existingTag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existingTag) {
      throw new NotFoundException("Tag no encontrado");
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verificar si el tag existe y pertenece al usuario
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException("Tag no encontrado");
    }

    // Eliminar el tag
    await this.prisma.tag.delete({
      where: { id },
    });

    return { message: "Tag eliminado correctamente" };
  }

  async findByName(name: string, userId: string) {
    return this.prisma.tag.findFirst({
      where: { name, userId },
    });
  }
}
