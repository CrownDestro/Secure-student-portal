'use client';
import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Users, Shield, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';
import Link from 'next/link';

interface UserWithId extends User { isActive: boolean; createdAt: string; }

function AdminDashboardInner() {
  const [users, setUsers]   = useState<UserWithId[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState<{ type: 'success'|'error'; text: string }|null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ users: UserWithId[]; total: number }>('/api/users');
      setUsers(res.users);
      setTotal(res.total);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const changeRole = async (id: string, role: UserRole) => {
    try {
      await api.patch(`/api/users/${id}/role`, { role });
      setMsg({ type: 'success', text: 'Role updated' });
      loadUsers();
    } catch { setMsg({ type: 'error', text: 'Failed to update role' }); }
  };

  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/api/users/${id}`);
      setMsg({ type: 'success', text: 'User deactivated' });
      loadUsers();
    } catch { setMsg({ type: 'error', text: 'Failed to deactivate' }); }
  };

  const roleBadge: Record<UserRole, string> = {
    student: 'bg-sky-100 text-sky-700 border border-sky-200',
    teacher: 'bg-violet-100 text-violet-700 border border-violet-200',
    admin:   'bg-rose-100 text-rose-700 border border-rose-200',
  };

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage users, roles, and system access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <Users className="w-5 h-5 text-sky-600 mb-2" />
          <p className="text-2xl font-semibold text-slate-900">{total}</p>
          <p className="text-slate-500 text-xs">Total Users</p>
        </div>
        <div className="card p-5">
          <Shield className="w-5 h-5 text-emerald-600 mb-2" />
          <p className="text-2xl font-semibold text-slate-900">{users.filter(u => u.isActive).length}</p>
          <p className="text-slate-500 text-xs">Active Users</p>
        </div>
        <Link href="/admin/audit" className="card p-5 transition-all hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
          <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
          <p className="text-2xl font-semibold text-slate-900">→</p>
          <p className="text-slate-500 text-xs">View Audit Logs</p>
        </Link>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Users table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-slate-900 font-semibold">User Management</h2>
          <span className="text-slate-500 text-xs">{total} users</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">User</th>
                  <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3.5">
                      <p className="text-slate-900 text-sm font-medium">{u.name}</p>
                      <p className="text-slate-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u.id, e.target.value as UserRole)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer bg-white shadow-sm focus:ring-2 focus:ring-[var(--accent)] ${roleBadge[u.role]}`}
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {u.isActive && (
                        <button onClick={() => deactivate(u.id)} className="text-rose-600 hover:text-rose-700 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <AdminDashboardInner />
      </DashboardLayout>
    </AuthGuard>
  );
}
