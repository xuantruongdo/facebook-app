import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { IUser } from 'src/type/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './entities/message.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Chat, ChatDocument } from 'src/chats/entities/chat.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: SoftDeleteModel<MessageDocument>,

    @InjectModel(Chat.name)
    private chatModel: SoftDeleteModel<ChatDocument>,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: IUser) {
    const { content, chat } = createMessageDto;

    const existChat = await this.chatModel.findOne({ _id: chat });

    if (!existChat) {
      throw new BadRequestException('Đoạn chat không tồn tại');
    }

    //@ts-ignore
    if (!existChat.users.includes(user._id)) {
      throw new BadRequestException('Người dùng không nằm trong đoạn chat');
    }

    const newMessage = await this.messageModel.create({
      ...createMessageDto,
      sender: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    await this.chatModel.findByIdAndUpdate(chat, {
      latestMessage: newMessage._id,
    });

    return newMessage.populate([
      { path: 'sender', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      {
        path: 'chat',
        select: {
          _id: 1,
          chatName: 1,
          isGroupChat: 1,
          users: 1,
          latestMessage: 1,
          groupAdmin: 1,
        },
      },
    ])
  }

  async findAll(_id: string) {
    return await this.messageModel.find({ chat: _id }).populate([
      { path: 'sender', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      {
        path: 'chat',
        select: {
          _id: 1,
          chatName: 1,
          isGroupChat: 1,
          users: 1,
          latestMessage: 1,
          groupAdmin: 1,
        },
      },
    ]);
  }
}
