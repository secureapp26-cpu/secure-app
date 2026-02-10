import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShiftStatus } from '../entities/shift.entity';

export class UpdateShiftStatusDto {
  @IsEnum(ShiftStatus, { message: 'El estado debe ser válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: ShiftStatus;
}
