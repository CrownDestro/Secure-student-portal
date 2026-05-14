'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { User, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import PasswordStrength from '@/components/auth/PasswordStrength';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ProfileInner />
      </DashboardLayout>
    </AuthGuard>
  );
}

function ProfileInner() {
  const { user }  = useAuth();
  const [pw, setPw]       = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg]     = useState<{ type: 'success'|'error'; text: string }|null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) { setMsg({ type: 'error', text: 'New passwords do not match' }); return; }
    if (pw.next.length < 8)    { setMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return; }
    setLoading(true);
    setMsg(null);
    try {
      await api.post('/api/auth/change-password', { currentPassword: pw.current, newPassword: pw.next });
      setMsg({ type: 'success', text: 'Password changed successfully' });
      setPw({ current: '', next: '', confirm: '' });
    } catch (err: unknown) {
      const e = err as { error?: string };
      setMsg({ type: 'error', text: e.error || 'Failed to change password' });
    } finally { setLoading(false); }
  };

  const roleColors: Record<string, string> = {
    student: 'bg-sky-100 text-sky-700 border-sky-200',
    teacher: 'bg-violet-100 text-violet-700 border-violet-200',
    admin:   'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <div className="px-8 py-10 max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900 mb-8">My Profile</h1>

      {/* Account info */}
      <div className="card p-6 mb-6">
        <h2 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-sky-600" /> Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-400 text-sm">Name</span>
            <span className="text-slate-900 text-sm font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-400 text-sm">Email</span>
            <span className="text-slate-900 text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-400 text-sm">Role</span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium uppercase tracking-wide ${roleColors[user?.role ?? 'student']}`}>
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 text-sm">Last login</span>
            <span className="text-slate-300 text-sm">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card p-6 mb-6">
        <h2 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600" /> Change Password
        </h2>

        {msg && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg mb-4 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {msg.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current' as const },
            { label: 'New Password',     key: 'next' as const },
            { label: 'Confirm New Password', key: 'confirm' as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
              <input
                type="password"
                value={pw[key]}
                onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                className="w-full bg-[var(--surface)] border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              />
              {key === 'next' && <PasswordStrength password={pw.next} />}
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="bg-[var(--accent)] hover:bg-[#4369e6] disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="card p-6">
        <h2 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" /> Session Security
        </h2>
        <div className="space-y-2 text-sm">
          {[
            ['JWT Token Expiry',   '15 minutes (auto-refresh on activity)'],
            ['Cookie Flags',       'HTTP-only + Secure + SameSite=Strict'],
            ['Auth Storage',       'No localStorage — token in HTTP-only cookie'],
            ['XSS Protection',     'Token inaccessible to JavaScript'],
            ['CSRF Protection',    'SameSite=Strict blocks cross-origin requests'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">{k}</span>
              <span className="text-emerald-600 text-xs font-mono text-right max-w-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
