import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ShiftService } from '../../shift/shift.service';
import { JwtPayload } from '../interfaces/authenticated-request.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly shiftService: ShiftService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(
      payload.sub,
      payload.device_id,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    // TODO: Uncomment shift validation when ready for production
    // const isInActiveShift = await this.shiftService.isUserInActiveShift(
    //   user.id,
    // );
    // if (!isInActiveShift) {
    //   throw new ForbiddenException(
    //     'Tu turno ha finalizado. No puedes realizar acciones fuera de tu horario asignado.',
    //   );
    // }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
      device_id: user.device_id,
    };
  }
}
