import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { SecurityService } from './services/security.service';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('throttle.ttl') || 60000,
          limit: config.get('throttle.limit') || 10,
        },
      ],
    }),
  ],
  providers: [RateLimitGuard, SecurityService],
  exports: [RateLimitGuard, SecurityService],
})
export class SecurityModule {}
