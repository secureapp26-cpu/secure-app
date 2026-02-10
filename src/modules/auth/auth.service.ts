import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserStatus, UserRole } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ShiftService } from '../shift/shift.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly shiftService: ShiftService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const saltRounds =
      this.configService.get<number>('security.bcryptSaltRounds') ?? 10;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const user = this.userRepository.create({
      email: registerDto.email,
      password_hash: hashedPassword,
      full_name: registerDto.full_name,
      role: registerDto.role,
      phone: registerDto.phone,
      company_id: registerDto.company_id,
    });

    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    delete (user as Partial<User>).password_hash;
    delete (user as Partial<User>).session_token;

    return {
      user,
      ...tokens,
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; access_token: string; refresh_token: string }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['company'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inactivo o suspendido');
    }

    // TODO: Uncomment shift validation when ready for production
    // const isInActiveShift = await this.shiftService.isUserInActiveShift(
    //   user.id,
    // );
    // if (!isInActiveShift) {
    //   throw new ForbiddenException(
    //     'No puedes iniciar sesión fuera de tu horario de turno asignado. Contacta a tu supervisor si necesitas una extensión.',
    //   );
    // }

    if (
      loginDto.device_id &&
      user.device_id &&
      user.device_id !== loginDto.device_id
    ) {
      await this.userRepository.update(user.id, {
        device_id: undefined,
        session_token: undefined,
      });
    }

    const updateData: Partial<User> = {
      last_login: new Date(),
    };

    if (loginDto.device_id) {
      updateData.device_id = loginDto.device_id;
    }

    await this.userRepository.update(user.id, updateData);

    const tokens = await this.generateTokens(user, loginDto.device_id);

    await this.userRepository.update(user.id, {
      session_token: tokens.refresh_token,
    });

    delete (user as Partial<User>).password_hash;
    delete (user as Partial<User>).session_token;

    return {
      user,
      ...tokens,
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.session_token !== refreshToken) {
        throw new UnauthorizedException('Token de refresco inválido');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Usuario inactivo o suspendido');
      }

      const tokens = await this.generateTokens(user, user.device_id);

      await this.userRepository.update(user.id, {
        session_token: tokens.refresh_token,
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      device_id: null,
      session_token: null,
    } as unknown as Partial<User>);
  }

  async validateUser(userId: string, deviceId?: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['company'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario inactivo o suspendido');
    }

    if (deviceId && user.device_id && user.device_id !== deviceId) {
      throw new UnauthorizedException('Sesión iniciada en otro dispositivo');
    }

    return user;
  }

  private async generateTokens(
    user: User,
    deviceId?: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: {
      sub: string;
      email: string;
      role: UserRole;
      company_id: string;
      device_id?: string;
    } = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };

    const finalDeviceId = deviceId ?? user.device_id;
    if (finalDeviceId) {
      payload.device_id = finalDeviceId;
    }

    // Type assertion needed: NestJS JWT types don't properly support string expiresIn with custom secret
    // Runtime behavior is correct as jsonwebtoken accepts string values like '15m', '7d'
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret')!,
        expiresIn: this.configService.get<string>('jwt.expiresIn')!,
      } as Parameters<JwtService['signAsync']>[1]),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret')!,
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn')!,
      } as Parameters<JwtService['signAsync']>[1]),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}
