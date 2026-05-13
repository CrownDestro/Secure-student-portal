'use client';
import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { AuditLog } from '@/types';
import { ScrollText, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs]     = useState<AuditLog[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get<{ logs: AuditLog[]; total: number; pages: number }>(
        `/api/audit?page=${p}&limit=20`
      );
      setLogs(res.logs);
      setTotal(res.total);
      setPages(res.pages);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLogs(page); }, [page, loadLogs]);

  const actionColor: Record<string, string> = {
    LOGIN:          'text-blue-400 bg-blue-500/10',
    LOGOUT:         'text-slate-400 bg-slate-500/10',
    REGISTER:       'text-green-400 bg-green-500/10',
    FILE_UPLOAD:    'text-purple-400 bg-purple-500/10',
    FILE_DOWNLOAD:  'text-yellow-400 bg-yellow-500/10',
    UPDATE_ROLE:    'text-orange-400 bg-orange-500/10',
    DEACTIVATE_USER:'text-red-400 bg-red-500/10',
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-yellow-400" /> Audit Logs
            </h1>
            <p className="text-slate-400 mt-1">{total} total events logged</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading audit logs...</div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left">
                      {['Timestamp', 'User', 'Action', 'Resource', 'IP', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-xs text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log._id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-white text-xs">{log.userId?.name || '—'}</p>
                          <p className="text-slate-500 text-xs">{log.userEmail || log.userId?.email}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${actionColor[log.action] || 'text-slate-400 bg-slate-800'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 text-xs font-mono max-w-xs truncate">{log.resource}</td>
                        <td className="px-5 py-3 text-slate-500 text-xs font-mono">{log.ipAddress}</td>
                        <td className="px-5 py-3">
                          {log.status === 'success'
                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                            : <XCircle className="w-4 h-4 text-red-400" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
                  <span className="text-slate-500 text-xs">Page {page} of {pages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                      className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
