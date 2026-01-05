import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { ApplicationsService } from '../applications.service';
import { Application } from '../entities/application.entity';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

import { Role } from '../../common/enums/role.enum';
import { VacancyStatus } from '../../common/enums/vacancy-status.enum';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  let appsRepo: {
    findOne: jest.MockedFunction<Repository<Application>['findOne']>;
    create: jest.MockedFunction<Repository<Application>['create']>;
    save: jest.MockedFunction<Repository<Application>['save']>;
    createQueryBuilder: jest.MockedFunction<Repository<Application>['createQueryBuilder']>;
  };

  let vacanciesRepo: {
    findOne: jest.MockedFunction<Repository<Vacancy>['findOne']>;
  };

  const coder = { sub: '2', email: 'coder@test.com', role: Role.CODER };
  const otherCoder = { sub: '3', email: 'other@test.com', role: Role.CODER };
  const admin = { sub: '1', email: 'admin@test.com', role: Role.ADMIN };

  beforeEach(async () => {
    appsRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    vacanciesRepo = {
      findOne: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(Application), useValue: appsRepo },
        { provide: getRepositoryToken(Vacancy), useValue: vacanciesRepo },
      ],
    }).compile();

    service = moduleRef.get(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should throw NotFound if vacancy does not exist', async () => {
      vacanciesRepo.findOne.mockResolvedValue(null);

      await expect(
        service.apply({ vacancyId: '10', coverLetter: 'hi' } as any, coder as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequest if vacancy is not OPEN', async () => {
      vacanciesRepo.findOne.mockResolvedValue({ id: '10', status: VacancyStatus.CLOSED } as any);

      await expect(
        service.apply({ vacancyId: '10' } as any, coder as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw Conflict if already applied', async () => {
      vacanciesRepo.findOne.mockResolvedValue({ id: '10', status: VacancyStatus.OPEN } as any);
      appsRepo.findOne.mockResolvedValue({ id: '99' } as any);

      await expect(
        service.apply({ vacancyId: '10' } as any, coder as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should create application and save (happy path)', async () => {
      vacanciesRepo.findOne.mockResolvedValue({ id: '10', status: VacancyStatus.OPEN } as any);
      appsRepo.findOne.mockResolvedValue(null);

      appsRepo.create.mockReturnValue({ id: '1' } as any);
      appsRepo.save.mockResolvedValue({
        id: '1',
        userId: coder.sub,
        vacancyId: '10',
        status: ApplicationStatus.PENDING,
      } as any);

      const res = await service.apply(
        { vacancyId: '10', coverLetter: '  hola  ' } as any,
        coder as any,
      );

      expect(appsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: coder.sub,
          vacancyId: '10',
          status: ApplicationStatus.PENDING,
          coverLetter: 'hola',
        }),
      );

      expect(res).toEqual(expect.objectContaining({ id: '1', vacancyId: '10' }));
    });

    it('should map unique constraint (23505) to ConflictException', async () => {
      vacanciesRepo.findOne.mockResolvedValue({ id: '10', status: VacancyStatus.OPEN } as any);
      appsRepo.findOne.mockResolvedValue(null);

      appsRepo.create.mockReturnValue({ id: '1' } as any);
      appsRepo.save.mockRejectedValue({ code: '23505' });

      await expect(
        service.apply({ vacancyId: '10' } as any, coder as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFound if application does not exist', async () => {
      appsRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('777', coder as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw Forbidden if CODER is not owner', async () => {
      appsRepo.findOne.mockResolvedValue({
        id: '1',
        userId: coder.sub, // owner = coder
      } as any);

      // otro coder intenta ver
      await expect(service.findOne('1', otherCoder as any)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should allow ADMIN to view any application', async () => {
      appsRepo.findOne.mockResolvedValue({ id: '1', userId: coder.sub } as any);

      const res = await service.findOne('1', admin as any);
      expect(res).toEqual(expect.objectContaining({ id: '1' }));
    });
  });

  describe('updateStatus', () => {
    it('should throw NotFound if application does not exist', async () => {
      appsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus('1', { status: ApplicationStatus.ACCEPTED } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequest if trying to set back to PENDING', async () => {
      appsRepo.findOne.mockResolvedValue({ id: '1', status: ApplicationStatus.REJECTED } as any);

      await expect(
        service.updateStatus('1', { status: ApplicationStatus.PENDING } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should update status', async () => {
      const app = { id: '1', status: ApplicationStatus.PENDING } as any;
      appsRepo.findOne.mockResolvedValue(app);
      appsRepo.save.mockResolvedValue({ ...app, status: ApplicationStatus.ACCEPTED });

      const res = await service.updateStatus('1', { status: ApplicationStatus.ACCEPTED } as any);
      expect(res.status).toBe(ApplicationStatus.ACCEPTED);
    });
  });
});
