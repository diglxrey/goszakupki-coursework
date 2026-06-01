import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Tender } from './tender.entity';

export type BidStatus = 'submitted' | 'won' | 'rejected';

@Entity('bids')
@Unique('uq_bid_tender_supplier', ['tenderId', 'supplierId'])
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tender_id' })
  tenderId: number;

  @ManyToOne(() => Tender, (tender) => tender.bids, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tender_id' })
  tender: Tender;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => User, (user) => user.bids, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: User;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'varchar', length: 20, default: 'submitted' })
  status: BidStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
