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
    student: 'bg-blue-500/20 text-blue-300',
    teacher: 'bg-purple-500/20 text-purple-300',
    admin:   'bg-red-500/20 text-red-300',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Manage users, roles, and system access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <Users className="w-5 h-5 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-slate-500 text-xs">Total Users</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <Shield className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">{users.filter(u => u.isActive).length}</p>
          <p className="text-slate-500 text-xs">Active Users</p>
        </div>
        <Link href="/admin/audit" className="bg-slate-900 border border-slate-800 hover:border-yellow-500/50 rounded-xl p-5 transition-all">
          <AlertCircle className="w-5 h-5 text-yellow-400 mb-2" />
          <p className="text-2xl font-bold text-white">→</p>
          <p className="text-slate-500 text-xs">View Audit Logs</p>
        </Link>
      </div>

      {/* Notification */}
      {msg && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg mb-5 ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Users table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold">User Management</h2>
          <span className="text-slate-500 text-xs">{total} users</span>
        </div>
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading users...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left">
                <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Role</th>
                <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-xs text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">{u.name}</p>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value as UserRole)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${roleBadge[u.role]} bg-transparent`}
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isActive && (
                      <button onClick={() => deactivate(u.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
