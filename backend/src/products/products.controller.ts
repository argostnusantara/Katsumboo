import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  getAll(@Query('categoryId') categoryId?: string) {
    return this.productsService.getAll(categoryId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Patch(':id/availability')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  toggleAvailability(@Param('id') id: string, @Body() body: { isAvailable: boolean }) {
    return this.productsService.update(id, { isAvailable: body.isAvailable });
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
