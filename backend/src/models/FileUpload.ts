import mongoose, { Document, Schema } from 'mongoose';

export interface IFileUpload extends Document {
  uploadedBy: mongoose.Types.ObjectId;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  isApproved: boolean;
  uploadedAt: Date;
}

const FileSchema = new Schema<IFileUpload>({
  uploadedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true, unique: true },
  mimeType:     { type: String, required: true },
  size:         { type: Number, required: true },
  path:         { type: String, required: true },
  isApproved:   { type: Boolean, default: false },
  uploadedAt:   { type: Date, default: Date.now },
});

export default mongoose.model<IFileUpload>('FileUpload', FileSchema);
