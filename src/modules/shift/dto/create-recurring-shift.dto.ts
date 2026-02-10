import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ArrayMinSize,
  Min,
  Max,
  IsInt,
} from 'class-validator';

export class CreateRecurringShiftDto {
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El user_id es requerido' })
  user_id: string;

  @IsString({ message: 'La hora de inicio debe ser un texto' })
  @IsNotEmpty({ message: 'La hora de inicio es requerida' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora de inicio debe estar en formato HH:MM:SS',
  })
  start_time: string;

  @IsString({ message: 'La hora de fin debe ser un texto' })
  @IsNotEmpty({ message: 'La hora de fin es requerida' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'La hora de fin debe estar en formato HH:MM:SS',
  })
  end_time: string;

  @IsArray({ message: 'Los días de la semana deben ser un arreglo' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un día' })
  @IsInt({ each: true, message: 'Cada día debe ser un número entero' })
  @Min(0, { each: true, message: 'El día debe estar entre 0 (Domingo) y 6 (Sábado)' })
  @Max(6, { each: true, message: 'El día debe estar entre 0 (Domingo) y 6 (Sábado)' })
  days_of_week: number[];

  @IsOptional()
  @IsString({ message: 'Las notas deben ser un texto' })
  notes?: string;
}
