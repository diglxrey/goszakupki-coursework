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
import { Bid } from './bid.entity';

export type ContractStatus = 'active' | 'completed' | 'terminated';

@Entity('contracts')
@Unique('uq_contract_tender', ['tenderId'])
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tender_id' })
  tenderId: number;

  @ManyToOne(() => Tender, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tender_id' })
  tender: Tender;

  @Column({ name: 'bid_id' })
  bidId: number;

  @ManyToOne(() => Bid, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bid_id' })
  bid: Bid;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => User, (user) => user.contractsAsSupplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: User;

  @Column({ name: 'customer_id' })
  customerId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'final_price', type: 'numeric', precision: 14, scale: 2 })
  finalPrice: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: ContractStatus;

  @CreateDateColumn({ name: 'signed_at' })
  signedAt: Date;
}
