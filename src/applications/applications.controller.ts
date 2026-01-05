import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/types/jwt-payload.type';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Roles(Role.CODER)
  @Post()
  apply(@Body() dto: CreateApplicationDto, @CurrentUser() user: JwtPayload) {
    return this.applicationsService.apply(dto, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Get()
  findAll(@Query() query: QueryApplicationsDto) {
    return this.applicationsService.findAll(query);
  }

  @Roles(Role.CODER)
  @Get('me')
  findMine(@Query() query: QueryApplicationsDto, @CurrentUser() user: JwtPayload) {
    return this.applicationsService.findMine(query, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.CODER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.applicationsService.findOne(id, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applicationsService.updateStatus(id, dto);
  }
}
