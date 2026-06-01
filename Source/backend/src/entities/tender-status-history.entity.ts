import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tender } from './tender.entity';

@Entity('tender_status_history')
export class TenderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tender_id' })
  tenderId: number;

  @ManyToOne(() => Tender, (tender) => tender.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tender_id' })
  tender: Tender;

  @Column({ name: 'old_status', type: 'varchar', length: 20, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', type: 'varchar', length: 20 })
  newStatus: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
