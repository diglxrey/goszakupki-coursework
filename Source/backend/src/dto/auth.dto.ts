import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsOptional()
  @IsIn(['customer', 'supplier', 'admin'], { message: 'Недопустимая роль' })
  role?: 'customer' | 'supplier' | 'admin';

  @IsOptional()
  @IsString()
  organization?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @IsIn(['customer', 'supplier', 'admin'], { message: 'Недопустимая роль' })
  role: 'customer' | 'supplier' | 'admin';

  @IsOptional()
  @IsString()
  organization?: string;
}
