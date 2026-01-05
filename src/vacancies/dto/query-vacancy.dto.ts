import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, IsArray } from 'class-validator';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { VacancySeniority } from '../../common/enums/vacancy-seniority.enum';

export class QueryVacancyDto {
  @IsOptional()
  @IsEnum(VacancySeniority)
  seniority?: VacancySeniority;

  @IsOptional()
  @IsString()
  tech?: string;

  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
