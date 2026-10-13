import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @Column({ type: 'varchar', length: 100 })
  model!: string;

  @Column({ type: 'varchar', length: 200 })
  specs!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  assignedTo!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'Available' })
  status!: string;

  @Column({ type: 'varchar', length: 200 })
  location!: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  lastUpdated!: Date;
}
