import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/entities/user.entity';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  author: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop()
  image: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: User.name })
  likes: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [] })
  comments: mongoose.Types.ObjectId[];

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

export const PostSchema = SchemaFactory.createForClass(Post);
