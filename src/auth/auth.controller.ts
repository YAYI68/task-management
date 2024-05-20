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
import { GetUser, Roles } from './decorators';
import { UserInterface } from './interfaces/user.interface';
import { SignInput } from './dto/sign-inputs';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/role.guard';
import { Role } from './enums/roles';

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

  @Post('login')
  login(@Body() loginInput: SignInput) {
    return this.authService.login(loginInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('user')
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/:id')
  findOne(@GetUser() user: UserInterface, @Param('id') id: string) {
    if (user.id !== id && user.role !== 'admin') {
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
    if (user.id !== id && user.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.authService.update(id, updateAuthDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('user/:id')
  remove(@GetUser() user: UserInterface, @Param('id') id: string) {
    if (user.id !== id && user.role !== 'admin') {
      throw new UnauthorizedException();
    }
    return this.authService.remove(id);
  }
}
