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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('available')
  getAvailable() {
    return this.productService.getAvailableProducts();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Post()
  create(@Body() createProductDto: any) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Put(':id')
  update(@Param('id') id: number, @Body() updateProductDto: any) {
    return this.productService.update(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard, new RolesGuard('admin'))
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.productService.delete(id);
  }
}
