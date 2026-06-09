import mongoose, { Schema, Document } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  shortCode: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date | null;
  deletedAt: Date | null;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

const urlSchema = new Schema<IUrl>(
  {
    originalUrl: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    expiresAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Url = mongoose.model<IUrl>('Url', urlSchema);
