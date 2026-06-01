import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tender } from '../entities/tender.entity';
import { TenderStatusHistory } from '../entities/tender-status-history.entity';
import { CreateTenderDto, UpdateTenderDto } from '../dto/tender.dto';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private readonly tendersRepository: Repository<Tender>,
    @InjectRepository(TenderStatusHistory)
    private readonly historyRepository: Repository<TenderStatusHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTenderDto, customerId: number): Promise<Tender> {
    const tender = this.tendersRepository.create({
      title: dto.title,
      description: dto.description,
      startPrice: dto.startPrice,
      deadline: new Date(dto.deadline),
      customerId,
      status: 'published',
    });
    return this.tendersRepository.save(tender);
  }

  async findAll(): Promise<any[]> {
    return this.dataSource.query(
      'SELECT * FROM v_tender_cards ORDER BY created_at DESC',
    );
  }

  async findByCustomer(customerId: number): Promise<Tender[]> {
    return this.tendersRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Tender> {
    const tender = await this.tendersRepository.findOne({
      where: { id },
      relations: ['customer', 'bids', 'bids.supplier'],
    });
    if (!tender) {
      throw new NotFoundException('Тендер не найден');
    }
    return tender;
  }

  async update(
    id: number,
    dto: UpdateTenderDto,
    userId: number,
  ): Promise<Tender> {
    const tender = await this.findOwned(id, userId);
    if (tender.status === 'awarded') {
      throw new BadRequestException(
        'Нельзя редактировать тендер после выбора победителя',
      );
    }
    Object.assign(tender, {
      title: dto.title ?? tender.title,
      description: dto.description ?? tender.description,
      startPrice: dto.startPrice ?? tender.startPrice,
      deadline: dto.deadline ? new Date(dto.deadline) : tender.deadline,
    });
    return this.tendersRepository.save(tender);
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const tender = await this.findOwned(id, userId);
    await this.tendersRepository.delete(tender.id);
    return { message: 'Тендер удалён' };
  }

  async award(
    tenderId: number,
    bidId: number,
    userId: number,
  ): Promise<{ message: string }> {
    await this.findOwned(tenderId, userId);
    try {
      await this.dataSource.query('CALL sp_award_tender($1, $2)', [
        tenderId,
        bidId,
      ]);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
    return { message: 'Победитель выбран, контракт создан' };
  }

  async cancel(
    tenderId: number,
    userId: number,
    reason?: string,
  ): Promise<{ message: string }> {
    await this.findOwned(tenderId, userId);
    try {
      await this.dataSource.query('CALL sp_cancel_tender($1, $2)', [
        tenderId,
        reason || null,
      ]);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
    return { message: 'Тендер отменён' };
  }

  async getHistory(tenderId: number): Promise<TenderStatusHistory[]> {
    return this.historyRepository.find({
      where: { tenderId },
      order: { changedAt: 'ASC' },
    });
  }

  async getStats(tenderId: number): Promise<any> {
    const rows = await this.dataSource.query(
      `SELECT
         fn_count_bids($1)              AS bids_count,
         fn_min_bid_price($1)           AS min_bid_price,
         fn_tender_economy_percent($1)  AS economy_percent`,
      [tenderId],
    );
    return rows[0];
  }

  async closeExpired(): Promise<{ message: string }> {
    await this.dataSource.query('CALL sp_close_expired_tenders()');
    return { message: 'Просроченные тендеры закрыты' };
  }

  private async findOwned(id: number, userId: number): Promise<Tender> {
    const tender = await this.tendersRepository.findOne({ where: { id } });
    if (!tender) {
      throw new NotFoundException('Тендер не найден');
    }
    if (tender.customerId !== userId) {
      throw new ForbiddenException('Доступ только для автора тендера');
    }
    return tender;
  }
}
