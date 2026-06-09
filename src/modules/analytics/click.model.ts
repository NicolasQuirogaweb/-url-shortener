import mongoose, { Schema, Document } from 'mongoose';

export interface IClick extends Document {
  urlId: mongoose.Types.ObjectId;
  shortCode: string;
  timestamp: Date;
  hashedIP: string;
  userAgent: string;
  deviceType: string;
  browser: string;
  os: string;
  referer: string;
  country: string;
  city: string;
  region: string;
}

const clickSchema = new Schema<IClick>({
  urlId: { type: Schema.Types.ObjectId, ref: 'Url', required: true, index: true },
  shortCode: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  hashedIP: { type: String, required: true },
  userAgent: { type: String, default: '' },
  deviceType: { type: String, default: '' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  referer: { type: String, default: '' },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  region: { type: String, default: '' },
});

clickSchema.index({ urlId: 1, timestamp: -1 });

export const Click = mongoose.model<IClick>('Click', clickSchema);
