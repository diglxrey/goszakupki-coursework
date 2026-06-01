import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContractsService } from '../services/contracts.service';
import { UpdateContractStatusDto } from '../dto/tender.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../configs/guards';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  @Roles('admin')
  findAll() {
    return this.contractsService.findAll();
  }

  @Get('rating')
  rating() {
    return this.contractsService.getSupplierRating();
  }

  @Get('my')
  findMy(@Request() req) {
    if (req.user.role === 'supplier') {
      return this.contractsService.findBySupplier(req.user.id);
    }
    return this.contractsService.findByCustomer(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles('customer', 'admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractStatusDto,
  ) {
    return this.contractsService.updateStatus(id, dto.status);
  }
}
