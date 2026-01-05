import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = this.usersRepo.create({
      fullName: dto.fullName.trim(),
      email,
      passwordHash,
      role: Role.CODER,
      isActive: true,
    });

    const saved = await this.usersRepo.save(user);

    const token = await this.signAccessToken(saved);

    return {
      user: this.sanitizeUser(saved),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '1d',
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new UnauthorizedException('User is inactive');

    const token = await this.signAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: this.config.get<string>('JWT_EXPIRES_IN') ?? '1d',
    };
  }

  private async signAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };

    return this.jwt.signAsync(payload);
  }

  private sanitizeUser(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
