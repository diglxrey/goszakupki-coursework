import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Bid } from './bid.entity';
import { TenderStatusHistory } from './tender-status-history.entity';

export type TenderStatus = 'published' | 'closed' | 'awarded' | 'cancelled';

@Entity('tenders')
export class Tender {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 250 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_price', type: 'numeric', precision: 14, scale: 2 })
  startPrice: number;

  @Column({ type: 'varchar', length: 20, default: 'published' })
  status: TenderStatus;

  @Column({ type: 'timestamp' })
  deadline: Date;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => User, (user) => user.tenders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'winner_bid_id', nullable: true })
  winnerBidId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Bid, (bid) => bid.tender)
  bids: Bid[];

  @OneToMany(() => TenderStatusHistory, (h) => h.tender)
  history: TenderStatusHistory[];
}
