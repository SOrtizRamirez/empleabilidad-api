import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Application } from './entities/application.entity';
import { Vacancy } from '../vacancies/entities/vacancy.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { VacancyStatus } from '../common/enums/vacancy-status.enum';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationsRepo: Repository<Application>,
    @InjectRepository(Vacancy)
    private readonly vacanciesRepo: Repository<Vacancy>,
  ) {}

  async apply(dto: CreateApplicationDto, actor: JwtPayload) {
    const vacancyId = dto.vacancyId;

    const vacancy = await this.vacanciesRepo.findOne({ where: { id: vacancyId } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');

    if (vacancy.status !== VacancyStatus.OPEN) {
      throw new BadRequestException('Vacancy is not open');
    }

    const existing = await this.applicationsRepo.findOne({
      where: { userId: actor.sub, vacancyId },
    });
    if (existing) throw new ConflictException('You already applied to this vacancy');

    const app = this.applicationsRepo.create({
      userId: actor.sub,
      vacancyId,
      status: ApplicationStatus.PENDING,
      coverLetter: dto.coverLetter?.trim() ?? null,
    });

    try {
      return await this.applicationsRepo.save(app);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException('You already applied to this vacancy');
      throw e;
    }
  }

  async findAll(query: QueryApplicationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.applicationsRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.vacancy', 'v')
      .leftJoinAndSelect('a.user', 'u')
      .orderBy('a.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) qb.andWhere('a.status = :status', { status: query.status });
    if (query.vacancyId) qb.andWhere('a.vacancyId = :vacancyId', { vacancyId: query.vacancyId });
    if (query.userId) qb.andWhere('a.userId = :userId', { userId: query.userId });

    const [data, total] = await qb.getManyAndCount();

    const sanitized = data.map((item) => {
      if (item.user && 'passwordHash' in item.user) (item.user as any).passwordHash = undefined;
      return item;
    });

    return { page, limit, total, data: sanitized };
  }

  async findMine(query: QueryApplicationsDto, actor: JwtPayload) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.applicationsRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.vacancy', 'v')
      .orderBy('a.createdAt', 'DESC')
      .where('a.userId = :userId', { userId: actor.sub })
      .skip(skip)
      .take(limit);

    if (query.status) qb.andWhere('a.status = :status', { status: query.status });
    if (query.vacancyId) qb.andWhere('a.vacancyId = :vacancyId', { vacancyId: query.vacancyId });

    const [data, total] = await qb.getManyAndCount();
    return { page, limit, total, data };
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.applicationsRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');

    if (dto.status === ApplicationStatus.PENDING) {
      throw new BadRequestException('Status cannot be set back to PENDING');
    }

    app.status = dto.status;
    return this.applicationsRepo.save(app);
  }

  async findOne(id: string, actor: JwtPayload) {
    const app = await this.applicationsRepo.findOne({
      where: { id },
      relations: { vacancy: true, user: true },
    });
    if (!app) throw new NotFoundException('Application not found');

    const isAdminOrGestor = actor.role === Role.ADMIN || actor.role === Role.GESTOR;
    const isOwner = String(app.userId) === String(actor.sub);

    if (!isAdminOrGestor && !isOwner) {
      throw new ForbiddenException('You are not allowed to view this application');
    }

    if (app.user && 'passwordHash' in app.user) (app.user as any).passwordHash = undefined;
    return app;
  }
}
