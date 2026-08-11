import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN' as any, 'SUPER_ADMIN' as any)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('promos')
  getPromos() {
    return this.adminService.getPromos();
  }

  @Post('promos')
  createPromo(@Body() body: any) {
    return this.adminService.createPromo(body);
  }

  @Put('promos/:id')
  updatePromo(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updatePromo(id, body);
  }

  @Delete('promos/:id')
  deletePromo(@Param('id') id: string) {
    return this.adminService.deletePromo(id);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getDashboardStats();
  }
}
