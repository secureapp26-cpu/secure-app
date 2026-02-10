import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ShiftService } from './shift.service';
import { CreateRecurringShiftDto } from './dto/create-recurring-shift.dto';
import { CreateExceptionShiftDto } from './dto/create-exception-shift.dto';
import { UpdateShiftStatusDto } from './dto/update-shift-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @Post('recurring')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async createRecurringShift(
    @Body() createRecurringShiftDto: CreateRecurringShiftDto,
    @Request() req,
  ) {
    const shift = await this.shiftService.createRecurringShift(
      createRecurringShiftDto.user_id,
      createRecurringShiftDto.start_time,
      createRecurringShiftDto.end_time,
      createRecurringShiftDto.days_of_week,
      req.user.sub,
      createRecurringShiftDto.notes,
    );

    return {
      message: 'Turno recurrente creado exitosamente',
      shift,
    };
  }

  @Post('exception')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async createExceptionShift(
    @Body() createExceptionShiftDto: CreateExceptionShiftDto,
    @Request() req,
  ) {
    const shift = await this.shiftService.createExceptionShift(
      createExceptionShiftDto.user_id,
      createExceptionShiftDto.exception_start,
      createExceptionShiftDto.exception_end,
      req.user.sub,
      createExceptionShiftDto.notes,
    );

    return {
      message: 'Extensión de turno creada exitosamente',
      shift,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async getAllShifts() {
    const shifts = await this.shiftService.getAllShifts();
    return { shifts };
  }

  @Get('user/:userId')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async getUserShifts(@Param('userId') userId: string) {
    const shifts = await this.shiftService.getUserShifts(userId);
    return { shifts };
  }

  @Get('my-shifts')
  async getMyShifts(@Request() req) {
    const shifts = await this.shiftService.getUserShifts(req.user.sub);
    return { shifts };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async getShiftById(@Param('id') id: string) {
    const shift = await this.shiftService.getShiftById(id);
    return { shift };
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async updateShiftStatus(
    @Param('id') id: string,
    @Body() updateShiftStatusDto: UpdateShiftStatusDto,
  ) {
    const shift = await this.shiftService.updateShiftStatus(
      id,
      updateShiftStatusDto.status,
    );

    return {
      message: 'Estado del turno actualizado exitosamente',
      shift,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async deleteShift(@Param('id') id: string) {
    await this.shiftService.deleteShift(id);
    return {
      message: 'Turno eliminado exitosamente',
    };
  }
}
