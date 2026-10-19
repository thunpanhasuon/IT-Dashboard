import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('login_attempts')
@Index('IDX_login_attempts_email_attemptedAt', ['email', 'attemptedAt'])
@Index('IDX_login_attempts_ip_attemptedAt', ['ip', 'attemptedAt'])
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 254 })
  email: string;

  @Column({ length: 64 })
  ip: string;

  @CreateDateColumn({ type: 'timestamptz' })
  attemptedAt: Date;
}
