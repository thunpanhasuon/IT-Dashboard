import { IsEnum } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity.js';

export class UpdateTicketDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
