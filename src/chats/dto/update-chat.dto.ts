import { PartialType } from '@nestjs/mapped-types';
import { CreateChatGroupDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatGroupDto) {}
