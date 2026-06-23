import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createOrderDto: any) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  getMyOrders(@Request() req) {
    return this.orderService.findByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Get('stats')
  getStats() {
    return this.orderService.getOrderStats();
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Get('by-status/:status')
  getByStatus(@Param('status') status: string) {
    return this.orderService.getOrdersByStatus(status);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: number, @Request() req) {
    // Users can only see their own orders, admins can see all
    if (req.user.role !== 'admin') {
      return this.orderService.findByUser(req.user.id).then((orders) => {
        const order = orders.find((o) => o.id === id);
        if (!order) {
          throw new Error('Access denied');
        }
        return order;
      });
    }
    return this.orderService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Put(':id/status')
  updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return this.orderService.updateStatus(id, status);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Put(':id')
  update(@Param('id') id: number, @Body() updateOrderDto: any) {
    return this.orderService.update(id, updateOrderDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.orderService.delete(id);
  }
}
