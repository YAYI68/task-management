import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInput } from './dto/sign-inputs';
import { Role } from './enums/roles';
import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(payload: JwtPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '30m',
        secret: await this.configService.get('JWT_SECRET'),
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: await this.configService.get('JWT_REFRESH_SECRET'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
  // hashing the string like password
  async hashData(data: string) {
    const hash = await argon2.hash(data);
    return hash;
  }
  // To verify the hash function

  async verifyHash(string1: string, string2: string) {
    const isValid = await argon2.verify(string1, string2);
    return isValid;
  }

  async createAdmin(createUser: CreateAuthDto) {
    try {
      const existUser = await this.prisma.user.findUnique({
        where: { email: createUser.email },
      });
      if (existUser) {
        throw new ConflictException('Email already exists');
      }

      const hashpassword = await this.hashData(createUser.password);
      const user = await this.prisma.user.create({
        data: {
          ...createUser,
          password: hashpassword,
          role: Role.Admin,
        },
      });
      const payload: JwtPayload = {
        id: user.id,
        role: user.role,
      };
      const token = await this.generateTokens(payload);
      const hashedRefreshToken = await this.hashData(token.refreshToken);
      await this.prisma.user.update({
        where: { email: createUser.email },
        data: {
          refreshToken: hashedRefreshToken,
        },
      });
      return { ...token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async createStaff(createUser: CreateAuthDto) {
    try {
      const existUser = await this.prisma.user.findUnique({
        where: { email: createUser.email },
      });
      if (existUser) {
        throw new ConflictException('Email already exists');
      }

      const hashpassword = await this.hashData(createUser.password);
      const user = await this.prisma.user.create({
        data: {
          ...createUser,
          password: hashpassword,
          role: Role.Admin,
        },
      });
      const payload: JwtPayload = {
        id: user.id,
        role: user.role,
      };
      const token = await this.generateTokens(payload);
      const hashedRefreshToken = await this.hashData(token.refreshToken);
      await this.prisma.user.update({
        where: { email: createUser.email },
        data: {
          refreshToken: hashedRefreshToken,
        },
      });
      return { ...token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async login(loginInput: SignInput) {
    try {
      const { email, password } = loginInput;
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new BadRequestException('invalid email/password');
      }
      const isValid = await this.verifyHash(password, user.password);
      if (user && isValid) {
        const payload: JwtPayload = { id: user.id, role: user.role };
        const token = await this.generateTokens(payload);
        const hashedRefreshToken = await argon2.hash(token.refreshToken);
        await this.prisma.user.update({
          where: { email },
          data: {
            refreshToken: hashedRefreshToken,
          },
        });
        return { ...token };
      }
      throw new BadRequestException('invalid email/password');
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id },
      });
      if (!user) {
        throw new NotFoundException();
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async update(id: string, updateAuthDto: UpdateAuthDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id: id },
        data: {
          ...updateAuthDto,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: { id: id },
      });
      return deletedUser;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }
}
