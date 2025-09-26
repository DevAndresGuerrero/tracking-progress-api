import { Injectable, NotFoundException } from "@nestjs/common";
import { Activity, Category, Tag, Progress } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";

type ActivityWithRelations = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  progress?: Array<{
    id: string;
    title: string;
    percentage: number;
    createdAt: Date;
  }>;
};

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto, userId: string): Promise<ActivityWithRelations> {
    const { tagIds, categoryId, ...activityData } = createActivityDto;

    const activity = await this.prisma.activity.create({
      data: {
        ...activityData,
        userId,
        categoryId,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        progress: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Create tag relations separately if needed
    if (tagIds && tagIds.length > 0) {
      await this.prisma.activityTag.createMany({
        data: tagIds.map((tagId) => ({
          activityId: activity.id,
          tagId,
        })),
      });

      // Fetch the activity again with tags
      const activityWithTags = await this.prisma.activity.findUnique({
        where: { id: activity.id },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          progress: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      return this.mapActivityToResponse(activityWithTags!);
    }

    // Since we just created it without tags, create a simple response
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      category: activity.category,
      tags: [],
      progress: activity.progress,
    };
  }

  async findAll(userId: string): Promise<ActivityWithRelations[]> {
    const activities = await this.prisma.activity.findMany({
      where: { userId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        progress: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return activities.map((activity) => this.mapActivityToResponse(activity));
  }

  async findOne(id: string, userId: string): Promise<ActivityWithRelations> {
    const activity = await this.prisma.activity.findFirst({
      where: { id, userId },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        progress: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundException("Actividad no encontrada");
    }

    return this.mapActivityToResponse(activity);
  }

  async update(id: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<ActivityWithRelations> {
    const { tagIds, categoryId, ...activityData } = updateActivityDto;

    // Verificar si la actividad existe y pertenece al usuario
    const existingActivity = await this.prisma.activity.findFirst({
      where: { id, userId },
    });

    if (!existingActivity) {
      throw new NotFoundException("Actividad no encontrada");
    }

    // Si hay tagIds, primero eliminar todos los tags existentes
    if (tagIds !== undefined) {
      await this.prisma.activityTag.deleteMany({
        where: { activityId: id },
      });
    }

    const updatedActivity = await this.prisma.activity.update({
      where: { id },
      data: {
        ...activityData,
        category: categoryId
          ? {
              connect: { id: categoryId },
            }
          : categoryId === null
            ? {
                disconnect: true,
              }
            : undefined,
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        progress: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return this.mapActivityToResponse(updatedActivity);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Verificar si la actividad existe y pertenece al usuario
    const activity = await this.prisma.activity.findFirst({
      where: { id, userId },
    });

    if (!activity) {
      throw new NotFoundException("Actividad no encontrada");
    }

    // Eliminar la actividad
    await this.prisma.activity.delete({
      where: { id },
    });

    return { message: "Actividad eliminada correctamente" };
  }

  private mapActivityToResponse(
    activity: Activity & {
      category: Category | null;
      tags: Array<{ tag: Tag }>;
      progress: Progress[];
    },
  ): ActivityWithRelations {
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
      category: activity.category,
      tags: activity.tags.map((at) => at.tag),
      progress: activity.progress,
    };
  }
}
