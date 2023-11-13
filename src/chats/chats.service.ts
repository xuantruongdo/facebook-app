import { BadRequestException, Injectable } from '@nestjs/common';
import {
  AddUserToGroupDto,
  CreateChatDto,
  CreateChatGroupDto,
} from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { IUser } from 'src/type/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './entities/chat.entity';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: SoftDeleteModel<ChatDocument>,
  ) {}

  async accessChat(createChatDto: CreateChatDto, user: IUser) {
    const { receivedId } = createChatDto;

    if (user._id === receivedId.toString()) {
      throw new BadRequestException('Không thể tạo nhóm chat với một mình bạn');
    }
    let chat = await this.chatModel
      .find({
        isGroupChat: false,
        $and: [
          { users: { $elemMatch: { $eq: user._id } } },
          { users: { $elemMatch: { $eq: receivedId } } },
        ],
      })
      .populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, name: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      ]);

    if (chat.length > 0) {
      return chat[0];
    } else {
      let chatData = {
        chatName: 'sender',
        users: [user._id, receivedId],
        createdBy: {
          _id: user?._id,
          email: user?.email,
        },
      };

      const newChat = await this.chatModel.create(chatData);

      return newChat.populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, name: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      ]);
    }
  }

  async fetchChatsCurrentUser(user: IUser) {
    return this.chatModel
      .find({
        users: { $elemMatch: { $eq: user._id } },
      })
      .sort('-updatedAt')
      .populate([
        {
          path: 'latestMessage',
          populate: {
            path: 'sender',
            select: { _id: 1, name: 1, email: 1, avatar: 1 },
          },
          select: { content: 1, sender: 1 },
        },
        { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
        {
          path: 'groupAdmin',
          select: { _id: 1, name: 1, email: 1, avatar: 1 },
        },
      ]);
  }

  async create(createChatGroupDto: CreateChatGroupDto, user: IUser) {
    const { chatName, users } = createChatGroupDto;
    if (!chatName || !users) {
      throw new BadRequestException('Vui lòng điền đủ thông tin');
    }

    if (users.length < 2) {
      throw new BadRequestException('Nhóm chat phải có ít nhất 3 người');
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    // Cast the objectId to unknown and then to Schema.Types.ObjectId
    const schemaUserId = userId as unknown as mongoose.Schema.Types.ObjectId;

    users.push(schemaUserId);

    const newGroup = await this.chatModel.create({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: user._id,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });

    return newGroup.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, name: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      { path: 'isGroupChat', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
    ]);
  }

  async renameGroup(_id: string, updateChatDto: UpdateChatDto, user: IUser) {
    const { chatName } = updateChatDto;
    await this.chatModel.updateOne(
      { _id },
      {
        chatName: chatName,
        updatedBy: {
          _id: user?._id,
          email: user?.email,
        },
      },
    );

    return await this.chatModel.findById(_id);
  }

  async addUserToGroup(_id: string, addUserToGroupDto: AddUserToGroupDto, user: IUser) {
    const { users } = addUserToGroupDto;

    const chat = await this.chatModel.findById(_id);

    if (!chat) {
      throw new BadRequestException('Đoạn chat không tồn tại');
    }

    if (!chat.users.includes(user?._id as any)) {
      throw new BadRequestException('Bạn không thuộc nhóm chat');
    }

    //@ts-ignore
    const userExistsInChat = users.some((user) => chat.users.includes(user));
    if (userExistsInChat) {
      throw new BadRequestException(
        'Ít nhất 1 thành viên đã tồn tại trong nhóm.',
      );
    }

    const mergedUsers = [...chat.users, ...users];

    //@ts-ignore
    chat.users = mergedUsers;

    await chat.save();

    return chat.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, name: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      {
        path: 'groupAdmin',
        select: { _id: 1, name: 1, email: 1, avatar: 1 },
      },
    ]);
  }

  async removeUserFromGroup(_id: string, addUserToGroupDto: AddUserToGroupDto, user: IUser) {
    const { users } = addUserToGroupDto;

    const chat = await this.chatModel.findById(_id);

    if (!chat) {
      throw new BadRequestException('Đoạn chat không tồn tại');
    }

    if (chat.groupAdmin.toString() !== user._id) {
      throw new BadRequestException('Chỉ admin mới có quyền xóa');
    }

    if (users.includes(user?._id as any)) {
      throw new BadRequestException('Không thể xóa admin');
    }

    if (chat.users.length - users.length < 3) {
      throw new BadRequestException('Đoạn chat phải có tối thiểu 3 thành viên');
    }

    const allUsersExistInChat = users.every((user) =>
      //@ts-ignore
      chat.users.includes(user),
    );
    if (!allUsersExistInChat) {
      throw new BadRequestException('Có thành viên không nằm trong đoạn chat');
    }

    for (const user of users) {
      //@ts-ignore
      const index = chat.users.indexOf(user);
      if (index !== -1) {
        chat.users.splice(index, 1);
      }
    }

    await chat.save();

    return chat.populate([
      {
        path: 'latestMessage',
        populate: {
          path: 'sender',
          select: { _id: 1, name: 1, email: 1, avatar: 1 },
        },
        select: { content: 1, sender: 1 },
      },
      { path: 'users', select: { _id: 1, name: 1, email: 1, avatar: 1 } },
      {
        path: 'groupAdmin',
        select: { _id: 1, name: 1, email: 1, avatar: 1 },
      },
    ]);
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
