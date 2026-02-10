import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './core/config/config.module';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShiftModule } from './modules/shift/shift.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, ShiftModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
