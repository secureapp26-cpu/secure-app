import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from '../services/security.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly securityService: SecurityService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const ip = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const path = req.path;

    // Check if IP is blocked
    if (this.securityService.isIPBlocked(ip)) {
      this.securityService.logSecurityEvent({
        ip,
        endpoint: path,
        timestamp: new Date(),
        type: 'blocked',
        details: 'Blocked IP attempted access',
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Access denied',
          error: 'Forbidden',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // Validate request size
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    if (!this.securityService.validateRequestSize(contentLength)) {
      this.securityService.markSuspiciousIP(ip);
      this.securityService.logSecurityEvent({
        ip,
        endpoint: path,
        timestamp: new Date(),
        type: 'suspicious',
        details: `Request size too large: ${contentLength} bytes`,
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'Request payload too large',
          error: 'Payload Too Large',
        },
        HttpStatus.PAYLOAD_TOO_LARGE,
      );
    }

    // Detect suspicious patterns
    if (this.securityService.detectSuspiciousPatterns(userAgent, path)) {
      this.securityService.markSuspiciousIP(ip);
      this.securityService.logSecurityEvent({
        ip,
        endpoint: path,
        timestamp: new Date(),
        type: 'suspicious',
        details: `Suspicious pattern detected in User-Agent or path`,
      });
    }

    next();
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return (forwarded as string).split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
