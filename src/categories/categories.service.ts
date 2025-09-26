import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException("Categoría no encontrada");
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    // Verificar si la categoría existe y pertenece al usuario
    const existingCategory = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!existingCategory) {
      throw new NotFoundException("Categoría no encontrada");
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verificar si la categoría existe y pertenece al usuario
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException("Categoría no encontrada");
    }

    // Eliminar la categoría
    await this.prisma.category.delete({
      where: { id },
    });

    return { message: "Categoría eliminada correctamente" };
  }

  async findByName(name: string, userId: string) {
    return this.prisma.category.findFirst({
      where: { name, userId },
    });
  }
}
