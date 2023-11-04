import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import mongoose from 'mongoose';

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
