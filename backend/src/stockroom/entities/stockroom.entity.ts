import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('stockroom')
export class Stockroom {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
    
    @Column({ type: 'varchar', length: 200 })
    name!: string;
    
    @Column({ type: 'int', default: 0})
    quantity: number;

}


