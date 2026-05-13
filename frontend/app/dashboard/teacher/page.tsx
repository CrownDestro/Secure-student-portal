'use client';
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FileUp, Files, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { FileRecord } from '@/types';

function TeacherDashboardInner() {
  const { user } = useAuth();
  const [files, setFiles]       = useState<FileRecord[]>([]);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ files: FileRecord[] }>('/api/files');
      setFiles(res.files);
    } catch { /* empty */ }
    finally { setLoading(false); }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.upload('/api/files/upload', fd);
      setMsg({ type: 'success', text: `"${file.name}" uploaded successfully` });
      loadFiles();
    } catch (err: unknown) {
      const e = err as { error?: string };
      setMsg({ type: 'error', text: e.error || 'Upload failed' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome, <span className="text-purple-400">{user?.name}</span> — manage assignments and submissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileUp className="w-4 h-4 text-purple-400" /> Upload Assignment
          </h2>
          <p className="text-slate-400 text-sm mb-4">Allowed: JPEG, PNG, GIF, PDF · Max 5MB</p>

          {msg && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg mb-4 ${msg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </div>
          )}

          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${uploading ? 'border-slate-700 cursor-not-allowed' : 'border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5'}`}>
            <Upload className={`w-8 h-8 mb-2 ${uploading ? 'text-slate-600' : 'text-slate-500'}`} />
            <p className="text-slate-400 text-sm">{uploading ? 'Uploading...' : 'Click to choose file'}</p>
            <input type="file" accept=".jpg,.jpeg,.png,.gif,.pdf" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>

          <div className="mt-3 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300 font-medium mb-1">Security checks applied:</p>
            <ul className="text-xs text-slate-400 space-y-0.5">
              <li>✓ MIME type verification</li>
              <li>✓ File size limit (5MB)</li>
              <li>✓ UUID filename (no traversal)</li>
              <li>✓ Stored outside web root</li>
            </ul>
          </div>
        </div>

        {/* Files list */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Files className="w-4 h-4 text-purple-400" /> Your Uploads
            </h2>
            <button onClick={loadFiles} className="text-xs text-slate-400 hover:text-white transition-colors">Refresh</button>
          </div>
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-sm">Loading...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No files yet. Upload one!</div>
          ) : (
            <div className="space-y-2">
              {files.map(f => (
                <div key={f.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{f.originalName}</p>
                    <p className="text-slate-500 text-xs">{(f.size / 1024).toFixed(1)} KB · {f.mimeType}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${f.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {f.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  return (
    <AuthGuard allowedRoles={['teacher']}>
      <DashboardLayout>
        <TeacherDashboardInner />
      </DashboardLayout>
    </AuthGuard>
  );
}
