import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';

export class CreateVacancyDto {
  @IsString()
  @MaxLength(140)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(140)
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus; // por defecto OPEN, pero lo permitimos si admin/gestor quiere
}
