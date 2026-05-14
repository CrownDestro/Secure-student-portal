'use client';
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttackCard, { ResultPanel, CodeBlock } from '@/components/attack/AttackCard';
import { api } from '@/lib/api';
import { AttackResult } from '@/types';
import { Code2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PAYLOADS = [
  '<script>alert("XSS!")</script>',
  '<img src=x onerror=alert(document.cookie)>',
  '<svg onload=alert(1)>',
  'Hello <b>World</b>',
  "javascript:alert('XSS')",
];

export default function XssDemoPage() {
  const [input, setInput]   = useState('');
  const [mode, setMode]     = useState<'vulnerable' | 'secure'>('vulnerable');
  const [result, setResult] = useState<AttackResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.post<AttackResult>('/api/attack/xss-demo', { input, mode });
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
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">XSS Demo</h1>
              <p className="text-slate-400 text-sm">OWASP A03:2021 — Cross-Site Scripting</p>
            </div>
          </div>

          <AttackCard title="Cross-Site Scripting (XSS)" severity="high"
            description="Scripts injected into a page execute in victims' browsers. Can steal cookies, redirect users, or perform actions on their behalf.">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <CodeBlock label="❌ Vulnerable Code" variant="danger"
                code={`// innerHTML — NEVER do this
div.innerHTML = userInput;
// <script>alert(1)</script>
// → executes in victim's browser!`} />
              <CodeBlock label="✅ Secure Code" variant="safe"
                code={`// React JSX — auto-escaped
return <div>{userInput}</div>;
// + html-entities escape() on backend
// + CSP: script-src 'self' (no inline)`} />
            </div>

            <div className="flex gap-2 mb-4">
              {(['vulnerable', 'secure'] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setResult(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize border ${mode === m
                    ? m === 'vulnerable' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'}`}>
                  {m === 'vulnerable' ? '⚠️ Vulnerable Mode' : '🛡 Secure Mode'}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <p className="text-xs text-slate-500 mb-2">Try these payloads:</p>
              <div className="flex flex-wrap gap-2">
                {PAYLOADS.map(p => (
                  <button key={p} onClick={() => setInput(p)}
                    className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-2.5 py-1 rounded font-mono transition-colors max-w-xs truncate">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                placeholder='Enter text or XSS payload...'
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              <button onClick={run} disabled={loading || !input.trim()}
                className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[#4369e6] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {loading ? 'Testing...' : 'Test'}
              </button>
            </div>

            {result && (
              <ResultPanel blocked={result.blocked ?? false} explanation={result.explanation}>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Raw output (what server returns):</p>
                    <pre className="bg-slate-50 border border-slate-200 rounded p-3 text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap">{result.rendered}</pre>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Browser render (React-safe):</p>
                    <div className="bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700">
                      {/* React auto-escapes this — safe even if XSS payload */}
                      {result.rendered}
                    </div>
                  </div>
                </div>
                {result.isAttack && (
                  <p className="mt-2 text-xs text-amber-600">
                    ⚡ Attack payload detected. In vulnerable mode, this would execute. In secure mode, it renders as plain text.
                  </p>
                )}
              </ResultPanel>
            )}
          </AttackCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
