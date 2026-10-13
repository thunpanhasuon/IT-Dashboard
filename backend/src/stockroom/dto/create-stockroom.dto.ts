import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateStockroomDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;
}
