import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExceptionShiftDto {
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El user_id es requerido' })
  user_id: string;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  exception_start: Date;

  @Type(() => Date)
  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  exception_end: Date;

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;
}
