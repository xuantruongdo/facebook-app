import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
} from 'class-validator';
import mongoose from 'mongoose';
import { IUserProvider } from 'src/type/users.interface';

export class CreateUserDto {}

export class RegisterUserDto {
  @IsEmail(
    {},
    {
      message: 'Email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'Email không được để trống',
  })
  email: string;

  @IsNotEmpty({
    message: 'Mật khẩu không được để trống',
  })
  password: string;

  @IsNotEmpty({
    message: 'Tên không được để trống',
  })
  name: string;
}

export class RegisterUserWithSocialDto {
  @IsNotEmpty({
    message: 'Type không được để trống',
  })
  type: string;


  @IsNotEmpty({
    message: 'User không được để trống',
  })
  user: IUserProvider;

}
