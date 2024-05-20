import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { jwtConstants } from '../contants/jwt-constant';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt_refresh',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.refresh_secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const { id } = payload;
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { id, refreshToken };
  }
}
