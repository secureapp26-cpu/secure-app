import { Request } from 'express';
import { UserRole } from '../../user/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  company_id: string;
  device_id?: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
