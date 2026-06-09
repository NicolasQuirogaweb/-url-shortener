import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string | null;
  googleId: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null, index: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);
