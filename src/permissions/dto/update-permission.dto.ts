import { IsString, IsOptional, IsNotEmpty } from "class-validator";

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
