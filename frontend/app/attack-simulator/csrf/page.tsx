'use client';
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttackCard, { ResultPanel, CodeBlock } from '@/components/attack/AttackCard';
import { api } from '@/lib/api';
import { AttackResult } from '@/types';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SCENARIOS = [
  { label: 'Attacker site (evil.com)',         origin: 'https://evil.com' },
  { label: 'Phishing domain (portaI-edu.com)', origin: 'https://portaI-edu.com' },
  { label: 'Localhost (same origin)',           origin: 'http://localhost:3000' },
];

export default function CsrfDemoPage() {
  const [origin, setOrigin]   = useState(SCENARIOS[0].origin);
  const [result, setResult]   = useState<AttackResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await api.post<AttackResult>('/api/attack/csrf-demo', { origin });
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
              <RefreshCw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">CSRF Demo</h1>
              <p className="text-slate-400 text-sm">OWASP A01:2021 — Broken Access Control</p>
            </div>
          </div>

          <AttackCard title="Cross-Site Request Forgery (CSRF)" severity="high"
            description="Forged requests trick the victim's browser into performing authenticated actions on a trusted site. The browser automatically sends cookies with every request.">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <CodeBlock label="❌ Vulnerable: Cookie without SameSite" variant="danger"
                code={`// Cookie sent on ALL requests including
// cross-origin ones!
res.cookie('token', jwt, {
  httpOnly: true
  // Missing: secure + sameSite!
});
// evil.com can forge: POST /api/delete`} />
              <CodeBlock label="✅ Secure: SameSite=Strict" variant="safe"
                code={`res.cookie('token', jwt, {
  httpOnly: true,      // no JS access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // blocks CSRF!
  maxAge: 900000,      // 15 min expiry
});
// Cross-origin: cookie NOT sent → 401`} />
            </div>

            {/* Attack scenario visualiser */}
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-800 font-medium mb-3">Attack Scenario:</p>
              <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                <div className="bg-rose-50 border border-rose-200 rounded px-3 py-2 text-rose-700">
                  👿 Attacker&apos;s Page<br/>
                  <span className="text-xs font-mono">{origin}</span>
                </div>
                <span className="text-slate-600">→ forged POST →</span>
                <div className="bg-sky-50 border border-sky-200 rounded px-3 py-2 text-sky-700">
                  🏫 Portal API<br/>
                  <span className="text-xs font-mono">localhost:5000/api/users/me</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Simulate request from:</p>
              <div className="flex flex-wrap gap-2">
                {SCENARIOS.map(s => (
                  <button key={s.origin} onClick={() => { setOrigin(s.origin); setResult(null); }}
                    className={`text-xs px-3 py-2 rounded-lg font-mono transition-all border ${origin === s.origin ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input value={origin} onChange={e => setOrigin(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
              <button onClick={run} disabled={loading}
                className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[#4369e6] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {loading ? 'Sending...' : 'Simulate Request'}
              </button>
            </div>

            {result && (
              <ResultPanel blocked={result.blocked ?? false} explanation={result.reason ?? result.explanation}>
                <p className="mt-2 text-xs text-slate-400">{result.explanation}</p>
              </ResultPanel>
            )}
          </AttackCard>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
