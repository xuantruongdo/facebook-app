import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  cover: string;
  role: string;
  isActive: boolean;
  type: string;
  work: string;
  live: string;
  from: string;
  followers: mongoose.Types.ObjectId[];
  followings: mongoose.Types.ObjectId[];
}


export interface IUserProvider {
  name: string;
  email: string;
  image: string;
}
