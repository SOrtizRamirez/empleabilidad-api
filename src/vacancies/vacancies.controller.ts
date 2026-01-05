import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { QueryVacancyDto } from './dto/query-vacancy.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';

import { VacancyStatus } from '../common/enums/vacancy-status.enum';
import { VacancySeniority } from '../common/enums/vacancy-seniority.enum';

@ApiTags('Vacancies')
@ApiBearerAuth('bearer')
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @ApiOperation({ summary: 'Create a vacancy (ADMIN/GESTOR)' })
  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  create(@Body() dto: CreateVacancyDto, @CurrentUser() user: JwtPayload) {
    return this.vacanciesService.create(dto, user);
  }

  // ✅ GET ALL (sin filtros, “como siempre”)
  @ApiOperation({ summary: 'Get all vacancies (authenticated)' })
  @Get()
  findAll() {
    return this.vacanciesService.findAll({}); // sin filtros
  }

  // ✅ GET SEARCH (con filtros tech/seniority/status/q/pagination)
  @ApiOperation({ summary: 'Search vacancies with filters (authenticated)' })
  @ApiQuery({ name: 'status', required: false, enum: VacancyStatus })
  @ApiQuery({ name: 'seniority', required: false, enum: VacancySeniority })
  @ApiQuery({
    name: 'tech',
    required: false,
    description: 'Comma-separated technologies. Example: nestjs,postgres',
    example: 'nestjs,postgres',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search in title/company/location', example: 'backend' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @Get('search')
  search(@Query() query: QueryVacancyDto) {
    return this.vacanciesService.findAll(query);
  }

  @ApiOperation({ summary: 'Get vacancy by id (authenticated)' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update vacancy (owner or ADMIN)' })
  @Roles(Role.ADMIN, Role.GESTOR, Role.CODER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVacancyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vacanciesService.update(id, dto, user);
  }

  @ApiOperation({ summary: 'Delete vacancy (owner or ADMIN)' })
  @Roles(Role.ADMIN, Role.GESTOR, Role.CODER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vacanciesService.remove(id, user);
  }
}
