import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class CreateChatDto {
  @IsNotEmpty({
    message: 'ReceivedId không được để trống',
  })
  @IsMongoId({ message: 'Role có định dạng là Mongo Id' })
  receivedId: mongoose.Schema.Types.ObjectId;
}

export class CreateChatGroupDto {
  @IsNotEmpty({
    message: 'ReceivedId không được để trống',
  })
  chatName: string;

  @IsNotEmpty({ message: 'Users không được để trống' })
  @IsMongoId({ each: true, message: 'Mỗi user phải có định dạng mongo id' })
  @IsArray({ message: 'Users có định dạng array' })
  users: mongoose.Schema.Types.ObjectId[];
}

export class AddUserToGroupDto {
  @IsNotEmpty({ message: 'Users không được để trống' })
  @IsMongoId({ each: true, message: 'Mỗi user phải có định dạng mongo id' })
  @IsArray({ message: 'Users có định dạng array' })
  users: mongoose.Schema.Types.ObjectId[];
}
