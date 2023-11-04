import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDto {

  @IsNotEmpty({
    message: 'Nội dung không được để trống',
  })
  content: string;

  @IsOptional()
  image: string;
}
