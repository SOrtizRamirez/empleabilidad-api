import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, ArrayMaxSize, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { VacancySeniority } from '../../common/enums/vacancy-seniority.enum';

export class CreateVacancyDto {
  @ApiProperty({ example: 'Backend NestJS' })
  @IsString()
  @MaxLength(140)
  title: string;

  @ApiProperty({ example: 'Construir APIs con NestJS, TypeORM y Postgres' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'RIWI' })
  @IsString()
  @MaxLength(140)
  company: string;

  @ApiPropertyOptional({ example: 'Remote' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  location?: string;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @ApiPropertyOptional({ example: 6000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @ApiPropertyOptional({ enum: VacancyStatus, example: VacancyStatus.OPEN })
  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;

  @ApiPropertyOptional({ enum: VacancySeniority, example: VacancySeniority.JUNIOR })
  @IsOptional()
  @IsEnum(VacancySeniority)
  seniority?: VacancySeniority;

  @ApiPropertyOptional({
    example: ['nestjs', 'typeorm', 'postgres'],
    description: 'List of technologies (normalized to lowercase).',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  technologies?: string[];
}
