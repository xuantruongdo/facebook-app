import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({default: "https://www.crescenttide.com/wp-content/uploads/2019/07/no-avatar-300x300.png"})
  avatar: string;

  @Prop()
  cover: string;

  @Prop()
  role: string;

  @Prop({default: false})
  isActive: boolean;

  @Prop()
  type: string;

  @Prop()
  note: string;

  @Prop()
  work: string;

  @Prop()
  live: string;

  @Prop()
  from: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  followers: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  followings: mongoose.Types.ObjectId[];

  @Prop()
  refreshToken: string;

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

export const UserSchema = SchemaFactory.createForClass(User);
