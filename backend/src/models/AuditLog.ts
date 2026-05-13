import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action:    { type: String, required: true },
  resource:  { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  status:    { type: String, enum: ['success', 'failure'], required: true },
  metadata:  { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
});

// TTL index: auto-delete logs older than 90 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
