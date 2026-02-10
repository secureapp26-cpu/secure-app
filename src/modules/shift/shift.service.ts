import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift, ShiftType, ShiftStatus } from './entities/shift.entity';

@Injectable()
export class ShiftService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async isUserInActiveShift(userId: string): Promise<boolean> {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = this.formatTime(now);

    const shifts = await this.shiftRepository.find({
      where: {
        user_id: userId,
        status: ShiftStatus.ACTIVE,
      },
    });

    if (shifts.length === 0) {
      return true;
    }

    for (const shift of shifts) {
      if (shift.type === ShiftType.EXCEPTION) {
        if (this.isInExceptionShift(shift, now)) {
          return true;
        }
      } else if (shift.type === ShiftType.RECURRING) {
        if (this.isInRecurringShift(shift, currentDay, currentTime)) {
          return true;
        }
      }
    }

    return false;
  }

  private isInExceptionShift(shift: Shift, now: Date): boolean {
    if (!shift.exception_start || !shift.exception_end) {
      return false;
    }

    const exceptionStart = new Date(shift.exception_start);
    const exceptionEnd = new Date(shift.exception_end);

    return now >= exceptionStart && now <= exceptionEnd;
  }

  private isInRecurringShift(
    shift: Shift,
    currentDay: number,
    currentTime: string,
  ): boolean {
    if (!shift.days_of_week || !shift.start_time || !shift.end_time) {
      return false;
    }

    const isDayIncluded = shift.days_of_week.includes(currentDay);
    if (!isDayIncluded) {
      return false;
    }

    return currentTime >= shift.start_time && currentTime <= shift.end_time;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  async createRecurringShift(
    userId: string,
    startTime: string,
    endTime: string,
    daysOfWeek: number[],
    approvedBy?: string,
    notes?: string,
  ): Promise<Shift> {
    const shift = this.shiftRepository.create({
      user_id: userId,
      type: ShiftType.RECURRING,
      start_time: startTime,
      end_time: endTime,
      days_of_week: daysOfWeek,
      status: ShiftStatus.ACTIVE,
      approved_by: approvedBy,
      notes,
    });

    return await this.shiftRepository.save(shift);
  }

  async createExceptionShift(
    userId: string,
    exceptionStart: Date,
    exceptionEnd: Date,
    approvedBy: string,
    notes?: string,
  ): Promise<Shift> {
    const shift = this.shiftRepository.create({
      user_id: userId,
      type: ShiftType.EXCEPTION,
      exception_start: exceptionStart,
      exception_end: exceptionEnd,
      status: ShiftStatus.ACTIVE,
      approved_by: approvedBy,
      notes,
    });

    return await this.shiftRepository.save(shift);
  }

  async getUserShifts(userId: string): Promise<Shift[]> {
    return await this.shiftRepository.find({
      where: { user_id: userId },
      relations: ['approver'],
      order: { created_at: 'DESC' },
    });
  }

  async updateShiftStatus(
    shiftId: string,
    status: ShiftStatus,
  ): Promise<Shift> {
    await this.shiftRepository.update(shiftId, { status });
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
    });
    if (!shift) {
      throw new Error(`Shift with id ${shiftId} not found`);
    }
    return shift;
  }

  async deleteShift(shiftId: string): Promise<void> {
    await this.shiftRepository.delete(shiftId);
  }

  async getShiftById(shiftId: string): Promise<Shift> {
    const shift = await this.shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['user', 'approver'],
    });
    if (!shift) {
      throw new Error(`Shift with id ${shiftId} not found`);
    }
    return shift;
  }

  async getAllShifts(): Promise<Shift[]> {
    return await this.shiftRepository.find({
      relations: ['user', 'approver'],
      order: { created_at: 'DESC' },
    });
  }
}
