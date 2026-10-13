import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';

@Injectable()
export class TicketsService {

  constructor (
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
  ) {}

  createTicket(dto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      title: dto.title,
      description: dto.description
      }
    )
    return this.ticketsRepository.save(ticket)
  }
  
  async findAll(): Promise<Ticket[]> {
   return await this.ticketsRepository.find();
  }
  
  async findOne(id: string): Promise<Ticket | null> {
    return await this.ticketsRepository.findOne({ where: { id } });
  }
  
  async update(id: string, updateDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    ticket.status = updateDto.status; 
    return this.ticketsRepository.save(ticket);
  }
}
