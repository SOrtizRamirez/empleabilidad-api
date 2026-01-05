import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { VacanciesService } from '../vacancies.service';
import { Vacancy } from '../entities/vacancy.entity';
import { Role } from '../../common/enums/role.enum';

describe('VacanciesService', () => {
  let service: VacanciesService;

  let vacanciesRepo: {
    findOne: jest.MockedFunction<Repository<Vacancy>['findOne']>;
    create: jest.MockedFunction<Repository<Vacancy>['create']>;
    save: jest.MockedFunction<Repository<Vacancy>['save']>;
    remove: jest.MockedFunction<Repository<Vacancy>['remove']>;
    createQueryBuilder: jest.MockedFunction<Repository<Vacancy>['createQueryBuilder']>;
  };

  const admin = { sub: '1', email: 'admin@test.com', role: Role.ADMIN };
  const ownerCoder = { sub: '2', email: 'coder@test.com', role: Role.CODER };
  const otherCoder = { sub: '3', email: 'other@test.com', role: Role.CODER };

  beforeEach(async () => {
    vacanciesRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        VacanciesService,
        { provide: getRepositoryToken(Vacancy), useValue: vacanciesRepo },
      ],
    }).compile();

    service = moduleRef.get(VacanciesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequest if salaryMin > salaryMax', async () => {
      await expect(
        service.create(
          {
            title: 't',
            description: 'd',
            company: 'c',
            salaryMin: 10,
            salaryMax: 5,
          } as any,
          admin as any,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should create and save vacancy with createdById', async () => {
      vacanciesRepo.create.mockReturnValue({ id: '10' } as any);
      vacanciesRepo.save.mockResolvedValue({
        id: '10',
        createdById: admin.sub,
        title: 'Backend',
      } as any);

      const res = await service.create(
        {
          title: '  Backend  ',
          description: '  Desc  ',
          company: '  ACME  ',
          location: '  Remote  ',
          salaryMin: 3000,
          salaryMax: 5000,
        } as any,
        admin as any,
      );

      expect(vacanciesRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Backend',
          description: 'Desc',
          company: 'ACME',
          location: 'Remote',
          createdById: admin.sub,
        }),
      );

      expect(vacanciesRepo.save).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: '10' }));
    });
  });

  describe('findOne', () => {
    it('should throw NotFound if vacancy does not exist', async () => {
      vacanciesRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should throw Forbidden if not admin and not owner', async () => {
      vacanciesRepo.findOne.mockResolvedValue({
        id: '10',
        createdById: ownerCoder.sub,
      } as any);

      await expect(
        service.update('10', { title: 'x' } as any, otherCoder as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should allow admin to update', async () => {
      vacanciesRepo.findOne.mockResolvedValue({
        id: '10',
        createdById: ownerCoder.sub,
        title: 'Old',
      } as any);

      vacanciesRepo.save.mockResolvedValue({ id: '10', title: 'New' } as any);

      const res = await service.update('10', { title: 'New' } as any, admin as any);

      expect(vacanciesRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New' }),
      );
      expect(res).toEqual(expect.objectContaining({ id: '10', title: 'New' }));
    });

    it('should throw BadRequest if salaryMin > salaryMax', async () => {
      vacanciesRepo.findOne.mockResolvedValue({
        id: '10',
        createdById: ownerCoder.sub,
      } as any);

      await expect(
        service.update(
          '10',
          { salaryMin: 10, salaryMax: 5 } as any,
          ownerCoder as any,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should throw Forbidden if not admin and not owner', async () => {
      vacanciesRepo.findOne.mockResolvedValue({
        id: '10',
        createdById: ownerCoder.sub,
      } as any);

      await expect(service.remove('10', otherCoder as any)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should allow owner to delete', async () => {
      const vacancy = { id: '10', createdById: ownerCoder.sub } as any;
      vacanciesRepo.findOne.mockResolvedValue(vacancy);
      vacanciesRepo.remove.mockResolvedValue(vacancy);

      const res = await service.remove('10', ownerCoder as any);

      expect(vacanciesRepo.remove).toHaveBeenCalledWith(vacancy);
      expect(res).toEqual({ deleted: true });
    });
  });
});
