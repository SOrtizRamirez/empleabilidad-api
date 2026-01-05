import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));


describe('AuthService', () => {
  let service: AuthService;

  let usersRepo: {
    findOne: jest.MockedFunction<Repository<User>['findOne']>;
    create: jest.MockedFunction<Repository<User>['create']>;
    save: jest.MockedFunction<Repository<User>['save']>;
  };

  let jwt: { signAsync: jest.Mock };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    usersRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jwt = { signAsync: jest.fn() };
    config = { get: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);

    config.get.mockImplementation((key: string) =>
      key === 'JWT_EXPIRES_IN' ? '1d' : undefined,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      (jest.spyOn(bcrypt, 'hash') as jest.SpyInstance).mockResolvedValue('hashed' as any);

      usersRepo.create.mockReturnValue({
        id: '1',
        fullName: 'Sharon Ortiz',
        email: 'sharon@test.com',
        passwordHash: 'hashed',
        role: Role.CODER,
        isActive: true,
      } as any);

      usersRepo.save.mockResolvedValue({
        id: '1',
        fullName: 'Sharon Ortiz',
        email: 'sharon@test.com',
        passwordHash: 'hashed',
        role: Role.CODER,
        isActive: true,
      } as any);

      jwt.signAsync.mockResolvedValue('token123');

      const res = await service.register({
        fullName: 'Sharon Ortiz',
        email: 'sharon@test.com',
        password: 'Password123!',
      } as any);

      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'sharon@test.com' },
      });

      expect(bcrypt.hash).toHaveBeenCalled();

      expect(jwt.signAsync).toHaveBeenCalledWith({
        sub: '1',
        email: 'sharon@test.com',
        role: Role.CODER,
      });

      expect(res).toEqual(
        expect.objectContaining({
          accessToken: 'token123',
          tokenType: 'Bearer',
          expiresIn: '1d',
          user: expect.objectContaining({
            id: '1',
            email: 'sharon@test.com',
            role: Role.CODER,
          }),
        }),
      );

      expect((res.user as any).passwordHash).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      usersRepo.findOne.mockResolvedValue({ id: '9' } as any);

      await expect(
        service.register({
          fullName: 'X',
          email: 'sharon@test.com',
          password: 'Password123!',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      usersRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'coder@test.com',
        passwordHash: 'hashed',
        role: Role.CODER,
        isActive: true,
      } as any);

      (jest.spyOn(bcrypt, 'compare') as jest.SpyInstance).mockResolvedValue(true as any);
      jwt.signAsync.mockResolvedValue('token123');

      const res = await service.login({
        email: 'coder@test.com',
        password: 'Password123!',
      } as any);

      expect(bcrypt.compare).toHaveBeenCalledWith('Password123!', 'hashed');
      expect(res.accessToken).toBe('token123');
      expect((res.user as any).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'x@test.com', password: 'x' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password invalid', async () => {
      usersRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'coder@test.com',
        passwordHash: 'hashed',
        role: Role.CODER,
        isActive: true,
      } as any);

      (jest.spyOn(bcrypt, 'compare') as jest.SpyInstance).mockResolvedValue(false as any);

      await expect(
        service.login({ email: 'coder@test.com', password: 'bad' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is inactive', async () => {
      usersRepo.findOne.mockResolvedValue({
        id: '1',
        email: 'coder@test.com',
        passwordHash: 'hashed',
        role: Role.CODER,
        isActive: false,
      } as any);

      (jest.spyOn(bcrypt, 'compare') as jest.SpyInstance).mockResolvedValue(true as any);

      await expect(
        service.login({ email: 'coder@test.com', password: 'Password123!' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
