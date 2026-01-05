import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { VacancySeniority } from '../../common/enums/vacancy-seniority.enum';

export class QueryVacancyDto {
  @ApiPropertyOptional({ enum: VacancyStatus })
  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;

  @ApiPropertyOptional({
    example: 'nestjs,postgres',
    description: 'Comma-separated technologies. Example: "nestjs,postgres"',
  })
  @IsOptional()
  @IsString()
  tech?: string;

  @ApiPropertyOptional({ enum: VacancySeniority })
  @IsOptional()
  @IsEnum(VacancySeniority)
  seniority?: VacancySeniority;

  @ApiPropertyOptional({ example: 'backend' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
