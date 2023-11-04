import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Message } from 'src/messages/entities/message.entity';
import { User } from 'src/users/entities/user.entity';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true })
  chatName: string;

  @Prop({ type: Boolean, default: false })
  isGroupChat: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    ref: User.name,
  })
  users: mongoose.Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Message.name })
  latestMessage: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  groupAdmin: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
