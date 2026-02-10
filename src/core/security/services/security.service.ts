import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SecurityEvent {
  ip: string;
  endpoint: string;
  timestamp: Date;
  type: 'rate_limit' | 'suspicious' | 'blocked';
  details?: string;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly suspiciousIPs = new Map<string, number>();
  private readonly blockedIPs = new Set<string>();

  constructor(private readonly configService: ConfigService) {}

  logSecurityEvent(event: SecurityEvent): void {
    this.logger.warn(
      `Security Event: ${event.type} | IP: ${event.ip} | Endpoint: ${event.endpoint} | Details: ${event.details || 'N/A'}`,
    );
  }

  markSuspiciousIP(ip: string): void {
    const count = (this.suspiciousIPs.get(ip) || 0) + 1;
    this.suspiciousIPs.set(ip, count);

    if (count >= 5) {
      this.blockIP(ip);
      this.logger.error(`IP ${ip} has been blocked due to suspicious activity`);
    }
  }

  blockIP(ip: string): void {
    this.blockedIPs.add(ip);
    this.logSecurityEvent({
      ip,
      endpoint: 'N/A',
      timestamp: new Date(),
      type: 'blocked',
      details: 'IP blocked due to suspicious activity',
    });
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip);
    this.suspiciousIPs.delete(ip);
    this.logger.log(`IP ${ip} has been unblocked`);
  }

  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs);
  }

  getSuspiciousIPs(): Map<string, number> {
    return new Map(this.suspiciousIPs);
  }

  validateRequestSize(contentLength: number): boolean {
    const maxSize =
      this.configService.get<number>('security.maxRequestSize') || 10485760; // 10MB default
    return contentLength <= maxSize;
  }

  detectSuspiciousPatterns(userAgent: string, path: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /\.\.\//, // Path traversal
      /<script>/i, // XSS attempt
      /union.*select/i, // SQL injection
      /exec\(/i, // Code injection
    ];

    return suspiciousPatterns.some(
      (pattern) => pattern.test(userAgent) || pattern.test(path),
    );
  }
}
