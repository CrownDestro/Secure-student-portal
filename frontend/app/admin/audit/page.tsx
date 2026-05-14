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
    LOGIN:           'text-sky-700 bg-sky-50 border border-sky-200',
    LOGOUT:          'text-slate-600 bg-slate-50 border border-slate-200',
    REGISTER:        'text-emerald-700 bg-emerald-50 border border-emerald-200',
    FILE_UPLOAD:     'text-violet-700 bg-violet-50 border border-violet-200',
    FILE_DOWNLOAD:   'text-amber-700 bg-amber-50 border border-amber-200',
    UPDATE_ROLE:     'text-orange-700 bg-orange-50 border border-orange-200',
    DEACTIVATE_USER: 'text-rose-700 bg-rose-50 border border-rose-200',
  };

  return (
    <AuthGuard allowedRoles={['admin']}>
      <DashboardLayout>
        <div className="px-8 py-10">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <ScrollText className="w-6 h-6 text-amber-600" /> Audit Logs
            </h1>
            <p className="text-slate-400 mt-1">{total} total events logged</p>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading audit logs...</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        {['Timestamp', 'User', 'Action', 'Resource', 'IP', 'Status'].map(h => (
                          <th key={h} className="px-5 py-3 text-xs text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-slate-900 text-xs">{log.userId?.name || '—'}</p>
                            <p className="text-slate-500 text-xs">{log.userEmail || log.userId?.email}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${actionColor[log.action] || 'text-slate-600 bg-slate-50 border border-slate-200'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-400 text-xs font-mono max-w-xs truncate">{log.resource}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs font-mono">{log.ipAddress}</td>
                          <td className="px-5 py-3">
                            {log.status === 'success'
                              ? <CheckCircle className="w-[18px] h-[18px] text-emerald-600" />
                              : <XCircle className="w-[18px] h-[18px] text-rose-600" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
                  <span className="text-slate-500 text-xs">Page {page} of {pages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}
                      className="p-1.5 rounded bg-slate-100 text-slate-500 hover:text-slate-900 disabled:opacity-40 transition-colors">
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
