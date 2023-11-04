import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateMessageDto {
  @IsNotEmpty({
    message: 'Nội dung không được để trống',
  })
  content: string;

  @IsNotEmpty({
    message: 'ChatId không được để trống',
  })
  @IsMongoId({ message: 'ChatId có định dạng là Mongo Id' })
  chat: mongoose.Schema.Types.ObjectId;
}
