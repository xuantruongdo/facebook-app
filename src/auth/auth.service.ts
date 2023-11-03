import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { Response } from 'express';
import { IUser } from 'src/type/users.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = await this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValid) {
        return user;
      }
    }

    return null;
  }

  async register(registerUserDto: RegisterUserDto) {
    let newUser = await this.usersService.register(registerUserDto);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, pic, role } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      pic,
      role,
    };

    const refresh_token = this.createRefreshToken(payload);

    await this.usersService.updateUserToken(refresh_token, _id);

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, pic, role },
    };
  }

  createRefreshToken = (payload: any) => {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });

    return refreshToken;
  };

  async processNewToken(refresh_token: string, response: Response) {
    try {
      let user = await this.usersService.findUserByToken(refresh_token);

      if (user) {
        const { _id, name, email, pic, role } = user;

        const payload = {
          sub: 'token login',
          iss: 'from server',
          _id,
          name,
          email,
          pic,
          role,
        };

        const refresh_token = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refresh_token, _id.toString());

        response.clearCookie('refresh_token');

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });
        return {
          access_token: this.jwtService.sign(payload),
          user: { _id, name, email, pic, role },
        };
      }
    } catch (err) {
      throw new BadRequestException(
        'Refresh token không hợp lệ! Vui lòng login',
      );
    }
  }

  async logout(response: Response, user: IUser) {
    await this.usersService.updateUserToken("", user._id);
    response.clearCookie("refresh_token");
    return "ok";
  }
}
