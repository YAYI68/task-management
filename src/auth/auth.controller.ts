import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators';
import { UserInterface } from './interfaces/user.interface';

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

  @UseGuards(AuthGuard('jwt'))
  // @UseGuards(new RolesGuard(Role.Admin))
  @Get('user')
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:id')
  findOne(@GetUser() user: UserInterface, @Param('id') id: string) {
    if (user.id !== id || user.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.authService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('user/:id')
  update(
    @GetUser() user: UserInterface,
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
  ) {
    if (user.id !== id || user.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.authService.update(id, updateAuthDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('user/:id')
  remove(@GetUser() user: UserInterface, @Param('id') id: string) {
    if (user.id !== id || user.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.authService.remove(id);
  }
}
