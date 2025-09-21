import { ActivityType } from "@prisma/client";
import { IsString, IsOptional, IsNotEmpty, IsEnum } from "class-validator";

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString({ each: true })
  tagIds?: string[];
}
