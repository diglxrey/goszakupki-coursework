import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tender } from './tender.entity';
import { Bid } from './bid.entity';
import { Contract } from './contract.entity';

export type UserRole = 'customer' | 'supplier' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, default: 'supplier' })
  role: UserRole;

  @Column({ type: 'varchar', length: 200, nullable: true })
  organization: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Tender, (tender) => tender.customer)
  tenders: Tender[];

  @OneToMany(() => Bid, (bid) => bid.supplier)
  bids: Bid[];

  @OneToMany(() => Contract, (contract) => contract.supplier)
  contractsAsSupplier: Contract[];
}
