import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VacanciesService } from './vacancies.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { QueryVacancyDto } from './dto/query-vacancy.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Vacancies')
@Controller('vacancies')
export class VacanciesController {
  constructor(private readonly vacanciesService: VacanciesService) {}

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  create(@Body() dto: CreateVacancyDto, @CurrentUser() user: JwtPayload) {
    return this.vacanciesService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryVacancyDto) {
    return this.vacanciesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacanciesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.CODER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVacancyDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.vacanciesService.update(id, dto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.CODER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.vacanciesService.remove(id, user);
  }
}
