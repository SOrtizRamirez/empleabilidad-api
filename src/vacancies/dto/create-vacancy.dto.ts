import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNumber,
  IsArray,
  ArrayMaxSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { VacancySeniority } from 'src/common/enums/vacancy-seniority.enum';

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
  status?: VacancyStatus;
  
  @IsOptional()
  @IsEnum(VacancySeniority)
  seniority?: VacancySeniority;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  technologies?: string[];
}
