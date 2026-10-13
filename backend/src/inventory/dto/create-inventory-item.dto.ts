import { Type } from 'class-transformer';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsString()
  @Length(1, 100)
  category!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorderLevel!: number;

  @IsString()
  @Length(1, 50)
  unit!: string;

  @IsString()
  @Length(1, 200)
  location!: string;
}
