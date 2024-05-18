import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin')
  createAdmin(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createAdmin(createAuthDto);
  }

  @Post('staff')
  createStaff(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createStaff(createAuthDto);
  }

  @Get('user')
  findAll() {
    return this.authService.findAll();
  }

  @Get('profile')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch('profile')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete('user/:id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
