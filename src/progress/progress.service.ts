import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProgressDto } from "./dto/create-progress.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProgressDto: CreateProgressDto, userId: string) {
    const progress = await this.prisma.progress.create({
      data: {
        title: createProgressDto.title,
        description: createProgressDto.description,
        status: createProgressDto.status || "NOT_STARTED",
        percentage: createProgressDto.percentage || 0,
        activityId: createProgressDto.activityId,
        startDate: createProgressDto.startDate,
        endDate: createProgressDto.endDate,
        estimatedCompletionDate: createProgressDto.estimatedCompletionDate,
        userId,
      },
      include: {
        activity: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return progress;
  }

  async findAll(userId: string) {
    const progress = await this.prisma.progress.findMany({
      where: {
        userId,
      },
      include: {
        activity: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return progress;
  }

  async findOne(id: string, userId: string) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        activity: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    if (!progress) {
      throw new Error("Progress not found");
    }

    return progress;
  }

  async update(id: string, updateProgressDto: UpdateProgressDto, userId: string) {
    const existingProgress = await this.prisma.progress.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProgress) {
      throw new Error("Progress not found");
    }

    const progress = await this.prisma.progress.update({
      where: {
        id,
      },
      data: {
        title: updateProgressDto.title,
        description: updateProgressDto.description,
        status: updateProgressDto.status,
        percentage: updateProgressDto.percentage,
        activityId: updateProgressDto.activityId,
        startDate: updateProgressDto.startDate,
        endDate: updateProgressDto.endDate,
        estimatedCompletionDate: updateProgressDto.estimatedCompletionDate,
      },
      include: {
        activity: {
          include: {
            category: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        },
      },
    });

    return progress;
  }

  async remove(id: string, userId: string) {
    const existingProgress = await this.prisma.progress.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProgress) {
      throw new Error("Progress not found");
    }

    const progress = await this.prisma.progress.delete({
      where: {
        id,
      },
    });

    return progress;
  }
}
