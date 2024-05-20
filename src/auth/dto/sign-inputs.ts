import { IsNotEmpty, IsString } from 'class-validator';

export class SignInput {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
