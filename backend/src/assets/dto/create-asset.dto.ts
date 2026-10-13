import { IsOptional, IsString, Length } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsString()
  @Length(1, 100)
  brand!: string;

  @IsString()
  @Length(1, 100)
  model!: string;

  @IsString()
  @Length(1, 200)
  specs!: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  assignedTo?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  status?: string;

  @IsString()
  @Length(1, 200)
  location!: string;
}
