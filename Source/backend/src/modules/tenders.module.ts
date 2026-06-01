import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tender } from '../entities/tender.entity';
import { TenderStatusHistory } from '../entities/tender-status-history.entity';
import { TendersService } from '../services/tenders.service';
import { TendersController } from '../controllers/tenders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tender, TenderStatusHistory])],
  controllers: [TendersController],
  providers: [TendersService],
  exports: [TendersService],
})
export class TendersModule {}
