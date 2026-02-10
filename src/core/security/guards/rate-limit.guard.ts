import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    // Use IP address as tracker, with X-Forwarded-For support for proxies
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (forwarded as string).split(',')[0].trim()
      : req.ip || req.socket.remoteAddress || 'unknown';

    return Promise.resolve(ip);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = await this.getTracker(request);

    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests from this IP, please try again later',
        error: 'Rate Limit Exceeded',
        ip,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
