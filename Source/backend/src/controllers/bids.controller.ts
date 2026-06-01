import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BidsService } from '../services/bids.service';
import { CreateBidDto } from '../dto/tender.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../configs/guards';

@Controller('bids')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @Roles('supplier', 'admin')
  create(@Body() dto: CreateBidDto, @Request() req) {
    return this.bidsService.create(dto, req.user.id);
  }

  @Get('my')
  @Roles('supplier', 'admin')
  findMy(@Request() req) {
    return this.bidsService.findBySupplier(req.user.id);
  }

  @Get('tender/:tenderId')
  findByTender(@Param('tenderId', ParseIntPipe) tenderId: number) {
    return this.bidsService.findByTender(tenderId);
  }

  @Put(':id')
  @Roles('supplier', 'admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { price?: number; comment?: string },
    @Request() req,
  ) {
    return this.bidsService.update(id, req.user.id, body.price, body.comment);
  }

  @Delete(':id')
  @Roles('supplier', 'admin')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.bidsService.remove(id, req.user.id);
  }
}
