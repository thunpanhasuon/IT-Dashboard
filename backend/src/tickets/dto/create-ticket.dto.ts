import { TicketStatus } from '../entities/ticket.entity.js';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';



export class CreateTicketDto {
  @Transform(({value}) => 
            typeof value === "string" ? value.trim() : value 
  )

  @IsString()
  @Length(1, 200)
  title!: string;
  
  @IsString()
  @Length(1, 5000)
  description!: string;
  
}
