import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Tender } from '../entities/tender.entity';
import { Bid } from '../entities/bid.entity';
import { Contract } from '../entities/contract.entity';
import { TenderStatusHistory } from '../entities/tender-status-history.entity';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { TendersModule } from './tenders.module';
import { BidsModule } from './bids.module';
import { ContractsModule } from './contracts.module';

@Module({
  imports: [

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'goszakupki',
      entities: [User, Tender, Bid, Contract, TenderStatusHistory],

      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    TendersModule,
    BidsModule,
    ContractsModule,
  ],
})
export class AppModule {}
