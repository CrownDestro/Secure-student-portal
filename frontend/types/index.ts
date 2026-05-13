export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
}

export interface ApiError {
  error?: string;
  errors?: Array<{ msg: string; param?: string }>;
}

export interface AuditLog {
  _id: string;
  userId?: { name: string; email: string };
  userEmail?: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'success' | 'failure';
  timestamp: string;
}

export interface FileRecord {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  isApproved: boolean;
  uploadedAt: string;
  uploadedBy?: { name: string; email: string };
}

export interface AttackResult {
  blocked: boolean;
  explanation: string;
  query?: string;
  result?: string;
  rendered?: string;
  reason?: string;
  checks?: Record<string, { value: string; blocked: boolean; reason: string }>;
  isAttack?: boolean;
}
