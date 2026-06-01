import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TendersService } from '../services/tenders.service';
import {
  CreateTenderDto,
  UpdateTenderDto,
  AwardTenderDto,
} from '../dto/tender.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../configs/guards';

@Controller('tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get()
  findAll() {
    return this.tendersService.findAll();
  }

  @Get('my')
  @Roles('customer', 'admin')
  findMy(@Request() req) {
    return this.tendersService.findByCustomer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tendersService.findOne(id);
  }

  @Get(':id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.tendersService.getHistory(id);
  }

  @Get(':id/stats')
  stats(@Param('id', ParseIntPipe) id: number) {
    return this.tendersService.getStats(id);
  }

  @Post()
  @Roles('customer', 'admin')
  create(@Body() dto: CreateTenderDto, @Request() req) {
    return this.tendersService.create(dto, req.user.id);
  }

  @Put(':id')
  @Roles('customer', 'admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTenderDto,
    @Request() req,
  ) {
    return this.tendersService.update(id, dto, req.user.id);
  }

  @Patch(':id/award')
  @Roles('customer', 'admin')
  award(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AwardTenderDto,
    @Request() req,
  ) {
    return this.tendersService.award(id, dto.bidId, req.user.id);
  }

  @Patch(':id/cancel')
  @Roles('customer', 'admin')
  cancel(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.tendersService.cancel(id, req.user.id);
  }

  @Delete(':id')
  @Roles('customer', 'admin')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.tendersService.remove(id, req.user.id);
  }
}
