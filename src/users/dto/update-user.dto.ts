import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  avatar: string;

  @IsOptional()
  cover: string;

  @IsOptional()
  note: string;

  @IsOptional()
  work: string;

  @IsOptional()
  live: string;

  @IsOptional()
  from: string;
}

export class ChangePasswordDto {

  @IsNotEmpty({
    message: 'Mật khẩu hiện tại không được để trống',
  })
  current_password: string;

  @IsNotEmpty({
    message: 'Mật khẩu mới không được để trống',
  })
  new_password: string;
}
