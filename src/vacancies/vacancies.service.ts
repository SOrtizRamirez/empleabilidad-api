import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Vacancy } from './entities/vacancy.entity';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { UpdateVacancyDto } from './dto/update-vacancy.dto';
import { QueryVacancyDto } from './dto/query-vacancy.dto';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { VacancySeniority } from '../common/enums/vacancy-seniority.enum';

@Injectable()
export class VacanciesService {
  constructor(
    @InjectRepository(Vacancy)
    private readonly vacanciesRepo: Repository<Vacancy>,
  ) {}

  async create(dto: CreateVacancyDto, actor: JwtPayload) {
    if (
      dto.salaryMin != null &&
      dto.salaryMax != null &&
      dto.salaryMin > dto.salaryMax
    ) {
      throw new BadRequestException(
        'salaryMin cannot be greater than salaryMax',
      );
    }

    const vacancy = this.vacanciesRepo.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      company: dto.company.trim(),
      location: dto.location?.trim() ?? null,

      salaryMin: dto.salaryMin != null ? dto.salaryMin.toFixed(2) : null,
      salaryMax: dto.salaryMax != null ? dto.salaryMax.toFixed(2) : null,

      status: dto.status,
      createdById: actor.sub,

      technologies: (dto.technologies ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      seniority: dto.seniority ?? null,
    });

    return this.vacanciesRepo.save(vacancy);
  }

  async findAll(query: QueryVacancyDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.vacanciesRepo
      .createQueryBuilder('v')
      .orderBy('v.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.status) {
      qb.andWhere('v.status = :status', { status: query.status });
    }

    if (query.q) {
      const q = `%${query.q.trim().toLowerCase()}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where('LOWER(v.title) LIKE :q', { q })
            .orWhere('LOWER(v.company) LIKE :q', { q })
            .orWhere("LOWER(COALESCE(v.location, '')) LIKE :q", { q });
        }),
      );
    }

    const [data, total] = await qb.getManyAndCount();

    if (query.seniority) {
      qb.andWhere('v.seniority = :seniority', { seniority: query.seniority });
    }

    if (query.tech) {
      const techs = query.tech
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (techs.length) {
        qb.andWhere('v.technologies && ARRAY[:...techs]::text[]', { techs });
      }
    }

    return {
      page,
      limit,
      total,
      data,
    };
  }

  async findOne(id: string) {
    const vacancy = await this.vacanciesRepo.findOne({ where: { id } });
    if (!vacancy) throw new NotFoundException('Vacancy not found');
    return vacancy;
  }

  async update(id: string, dto: UpdateVacancyDto, actor: JwtPayload) {
    const vacancy = await this.findOne(id);

    const isAdmin = actor.role === Role.ADMIN;
    const isOwner = String(vacancy.createdById) === String(actor.sub);

    if (dto.technologies !== undefined) {
      vacancy.technologies = (dto.technologies ?? [])
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    if (dto.seniority !== undefined) {
      vacancy.seniority = dto.seniority ?? null;
    }

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to update this vacancy',
      );
    }

    if (
      dto.salaryMin != null &&
      dto.salaryMax != null &&
      dto.salaryMin > dto.salaryMax
    ) {
      throw new BadRequestException(
        'salaryMin cannot be greater than salaryMax',
      );
    }

    if (dto.title != null) vacancy.title = dto.title.trim();
    if (dto.description != null) vacancy.description = dto.description.trim();
    if (dto.company != null) vacancy.company = dto.company.trim();
    if (dto.location !== undefined)
      vacancy.location = dto.location?.trim() ?? null;

    if (dto.salaryMin !== undefined)
      vacancy.salaryMin =
        dto.salaryMin != null ? dto.salaryMin.toFixed(2) : null;
    if (dto.salaryMax !== undefined)
      vacancy.salaryMax =
        dto.salaryMax != null ? dto.salaryMax.toFixed(2) : null;

    if (dto.status != null) vacancy.status = dto.status;

    return this.vacanciesRepo.save(vacancy);
  }

  async remove(id: string, actor: JwtPayload) {
    const vacancy = await this.findOne(id);

    const isAdmin = actor.role === Role.ADMIN;
    const isOwner = String(vacancy.createdById) === String(actor.sub);

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You are not allowed to delete this vacancy',
      );
    }

    await this.vacanciesRepo.remove(vacancy);
    return { deleted: true };
  }
}
