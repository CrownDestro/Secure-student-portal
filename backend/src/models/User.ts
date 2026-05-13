import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  failedLogins: number;
  lockUntil?: Date;
  lastLogin?: Date;
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role:         { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  isActive:     { type: Boolean, default: true },
  failedLogins: { type: Number, default: 0 },
  lockUntil:    { type: Date },
  lastLogin:    { type: Date },
  createdAt:    { type: Date, default: Date.now },
});

// Virtual: is account currently locked?
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Instance method: constant-time password comparison
UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

// Pre-save: hash password if modified
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

export default mongoose.model<IUser>('User', UserSchema);
