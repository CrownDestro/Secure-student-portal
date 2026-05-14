'use client';
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttackCard, { ResultPanel, CodeBlock } from '@/components/attack/AttackCard';
import { api } from '@/lib/api';
import { AttackResult } from '@/types';
import { Upload, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const SCENARIOS = [
  { label: 'PHP Shell',         filename: 'shell.php',               mimetype: 'application/x-php' },
  { label: 'Shell disguised',   filename: 'photo.jpg',               mimetype: 'application/x-php' },
  { label: 'Traversal attack',  filename: '../../../etc/passwd',      mimetype: 'image/jpeg' },
  { label: 'Double extension',  filename: 'invoice.pdf.exe',          mimetype: 'application/x-msdownload' },
  { label: 'Valid PDF',         filename: 'assignment.pdf',           mimetype: 'application/pdf' },
  { label: 'Valid image',       filename: 'screenshot.png',           mimetype: 'image/png' },
];

export default function UploadDemoPage() {
  const [filename, setFilename] = useState('shell.php');
  const [mimetype, setMimetype] = useState('application/x-php');
  const [result, setResult]     = useState<AttackResult | null>(null);
  const [loading, setLoading]   = useState(false);

  const selectScenario = (s: typeof SCENARIOS[0]) => {
    setFilename(s.filename);
    setMimetype(s.mimetype);
    setResult(null);
  };

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.post<AttackResult>('/api/attack/upload-demo', { filename, mimetype });
      setResult(res);
    } catch { setResult(null); }
    finally { setLoading(false); }
  };

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-8 py-10 max-w-4xl">
          <Link href="/attack-simulator" className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Simulator
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center">
              <Upload className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Malicious File Upload Demo</h1>
              <p className="text-slate-400 text-sm">OWASP A04:2021 — Insecure Design</p>
            </div>
          </div>

          <AttackCard title="Malicious File Upload" severity="critical"
            description="Uploading PHP web shells, executables, or files with directory traversal names can achieve Remote Code Execution or expose server files.">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <CodeBlock label="❌ Vulnerable Upload Handler" variant="danger"
                code={`// No validation — stores whatever is sent
app.post('/upload', (req, res) => {
  const file = req.files.upload;
  // Saves as: /var/www/uploads/shell.php
  // Attacker visits: /uploads/shell.php
  // → Remote Code Execution!
  file.mv(\`./uploads/\${file.name}\`);
});`} />
              <CodeBlock label="✅ Secure Upload Handler" variant="safe"
                code={`// 1. MIME allowlist check
// 2. UUID filename (no traversal)
// 3. File stored outside web root
// 4. Served via authenticated endpoint
const safe = crypto.randomUUID() + ext;
multer({ fileFilter, limits: {
  fileSize: 5 * 1024 * 1024   // 5MB max
}})`} />
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Try attack scenarios:</p>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map(s => (
                  <button key={s.label} onClick={() => selectScenario(s)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg transition-all border ${filename === s.filename && mimetype === s.mimetype
                      ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Filename</label>
                <input value={filename} onChange={e => setFilename(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">MIME type (Content-Type)</label>
                <input value={mimetype} onChange={e => setMimetype(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              </div>
            </div>

            <button onClick={run} disabled={loading || !filename}
              className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[#4369e6] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors mb-4">
              {loading ? 'Checking...' : 'Run Security Checks'}
            </button>

            {result && (
              <>
                <ResultPanel blocked={result.blocked ?? false} explanation={result.explanation} />
                {result.checks && (
                  <div className="mt-4 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-slate-200">
                      <p className="text-sm font-medium text-slate-900">Security Check Results</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-4 py-2 text-xs text-slate-500">Check</th>
                          <th className="px-4 py-2 text-xs text-slate-500">Value</th>
                          <th className="px-4 py-2 text-xs text-slate-500">Status</th>
                          <th className="px-4 py-2 text-xs text-slate-500">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.checks).map(([key, check]) => (
                          <tr key={key} className="border-b border-slate-100">
                            <td className="px-4 py-2.5 text-slate-600 text-xs font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                            <td className="px-4 py-2.5 text-slate-700 text-xs font-mono max-w-xs truncate">{check.value}</td>
                            <td className="px-4 py-2.5">
                              {check.blocked
                                ? <XCircle className="w-4 h-4 text-rose-600" />
                                : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{check.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </AttackCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
