import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  dueDate: string;
}

export class StaffIdDto {
  @IsNotEmpty()
  @IsString()
  staffId: string;
}


