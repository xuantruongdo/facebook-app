import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './entities/chat.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }])],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService]
})
export class ChatsModule {}
