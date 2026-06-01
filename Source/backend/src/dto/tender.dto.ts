import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  IsInt,
  IsIn,
} from 'class-validator';

export class CreateTenderDto {
  @IsString()
  @IsNotEmpty({ message: 'Название тендера обязательно' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({}, { message: 'Начальная цена должна быть числом' })
  @IsPositive({ message: 'Начальная цена должна быть больше нуля' })
  startPrice: number;

  @IsDateString({}, { message: 'Некорректная дата дедлайна' })
  deadline: string;
}

export class UpdateTenderDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Начальная цена должна быть числом' })
  @IsPositive({ message: 'Начальная цена должна быть больше нуля' })
  startPrice?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректная дата дедлайна' })
  deadline?: string;
}

export class CreateBidDto {
  @IsInt({ message: 'Некорректный идентификатор тендера' })
  tenderId: number;

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @IsPositive({ message: 'Цена должна быть больше нуля' })
  price: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class AwardTenderDto {
  @IsInt({ message: 'Некорректный идентификатор заявки' })
  bidId: number;
}

export class UpdateContractStatusDto {
  @IsIn(['active', 'completed', 'terminated'], {
    message: 'Недопустимый статус контракта',
  })
  status: 'active' | 'completed' | 'terminated';
}
