import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Contract } from '../entities/contract.entity';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(): Promise<any[]> {
    return this.dataSource.query(
      'SELECT * FROM v_contracts_summary ORDER BY signed_at DESC',
    );
  }

  async findBySupplier(supplierId: number): Promise<Contract[]> {
    return this.contractsRepository.find({
      where: { supplierId },
      relations: ['tender', 'customer'],
      order: { signedAt: 'DESC' },
    });
  }

  async findByCustomer(customerId: number): Promise<Contract[]> {
    return this.contractsRepository.find({
      where: { customerId },
      relations: ['tender', 'supplier'],
      order: { signedAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Contract> {
    const contract = await this.contractsRepository.findOne({
      where: { id },
      relations: ['tender', 'supplier', 'customer', 'bid'],
    });
    if (!contract) {
      throw new NotFoundException('Контракт не найден');
    }
    return contract;
  }

  async updateStatus(
    id: number,
    status: 'active' | 'completed' | 'terminated',
  ): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.status = status;
    return this.contractsRepository.save(contract);
  }

  async getSupplierRating(): Promise<any[]> {
    return this.dataSource.query(
      'SELECT * FROM v_supplier_rating ORDER BY contracts_total_sum DESC',
    );
  }
}
