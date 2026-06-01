import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bid } from '../entities/bid.entity';
import { CreateBidDto } from '../dto/tender.dto';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidsRepository: Repository<Bid>,
  ) {}

  async create(dto: CreateBidDto, supplierId: number): Promise<Bid> {
    const existing = await this.bidsRepository.findOne({
      where: { tenderId: dto.tenderId, supplierId },
    });
    if (existing) {
      throw new BadRequestException('Вы уже подали заявку на этот тендер');
    }

    const bid = this.bidsRepository.create({
      tenderId: dto.tenderId,
      supplierId,
      price: dto.price,
      comment: dto.comment,
      status: 'submitted',
    });

    try {
      return await this.bidsRepository.save(bid);
    } catch (e) {

      throw new BadRequestException(e.message);
    }
  }

  async findByTender(tenderId: number): Promise<Bid[]> {
    return this.bidsRepository.find({
      where: { tenderId },
      relations: ['supplier'],
      order: { price: 'ASC' },
    });
  }

  async findBySupplier(supplierId: number): Promise<Bid[]> {
    return this.bidsRepository.find({
      where: { supplierId },
      relations: ['tender'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Bid> {
    const bid = await this.bidsRepository.findOne({
      where: { id },
      relations: ['tender', 'supplier'],
    });
    if (!bid) {
      throw new NotFoundException('Заявка не найдена');
    }
    return bid;
  }

  async update(
    id: number,
    supplierId: number,
    price?: number,
    comment?: string,
  ): Promise<Bid> {
    const bid = await this.findOne(id);
    if (bid.supplierId !== supplierId) {
      throw new ForbiddenException('Можно изменять только свои заявки');
    }
    if (bid.status !== 'submitted') {
      throw new BadRequestException('Заявка уже обработана, изменение невозможно');
    }
    if (price !== undefined) bid.price = price;
    if (comment !== undefined) bid.comment = comment;
    return this.bidsRepository.save(bid);
  }

  async remove(id: number, supplierId: number): Promise<{ message: string }> {
    const bid = await this.findOne(id);
    if (bid.supplierId !== supplierId) {
      throw new ForbiddenException('Можно отозвать только свою заявку');
    }
    if (bid.status === 'won') {
      throw new BadRequestException('Нельзя отозвать выигравшую заявку');
    }
    await this.bidsRepository.delete(id);
    return { message: 'Заявка отозвана' };
  }
}
