'use client';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { AlertTriangle, Database, Code2, RefreshCw, Upload, ChevronRight } from 'lucide-react';

const attacks = [
  {
    href: '/attack-simulator/sqli',
    icon: Database,
    title: 'SQL / NoSQL Injection',
    severity: 'critical',
    owasp: 'A03:2021',
    desc: 'Inject malicious operators into database queries to bypass authentication or dump all records.',
    what: 'Mongoose ORM + express-mongo-sanitize blocks $-operator injection',
  },
  {
    href: '/attack-simulator/xss',
    icon: Code2,
    title: 'Cross-Site Scripting (XSS)',
    severity: 'high',
    owasp: 'A03:2021',
    desc: 'Inject scripts that run in other users\' browsers, enabling session hijacking and phishing.',
    what: 'React auto-escaping + Content-Security-Policy + html-entities',
  },
  {
    href: '/attack-simulator/csrf',
    icon: RefreshCw,
    title: 'Cross-Site Request Forgery',
    severity: 'high',
    owasp: 'A01:2021',
    desc: 'Trick a logged-in user\'s browser into making an authenticated request to a different site.',
    what: 'SameSite=Strict JWT cookie + CSRF double-submit token',
  },
  {
    href: '/attack-simulator/upload',
    icon: Upload,
    title: 'Malicious File Upload',
    severity: 'critical',
    owasp: 'A04:2021',
    desc: 'Upload PHP shells, executables, or traversal payloads to achieve Remote Code Execution.',
    what: 'MIME allowlist + magic bytes check + UUID rename + outside web root',
  },
];

const severityStyle: Record<string, string> = {
  critical: 'bg-rose-50 border-rose-200 text-rose-700',
  high:     'bg-amber-50 border-amber-200 text-amber-700',
};

export default function AttackSimulatorIndex() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="px-8 py-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Educational Environment — All attacks are simulated safely
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Attack Simulation Dashboard</h1>
            <p className="text-slate-500 mt-1">Understand how attacks work and how our secure implementation blocks them</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {attacks.map(({ href, icon: Icon, title, severity, owasp, desc, what }) => (
              <Link key={href} href={href}
                className="group card p-6 transition-all hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">{owasp}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded border uppercase ${severityStyle[severity]}`}>{severity}</span>
                  </div>
                </div>
                <h3 className="text-slate-900 font-semibold mb-2">{title}</h3>
                <p className="text-slate-500 text-sm mb-4">{desc}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-emerald-600">🛡 {what}</p>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 card p-6">
            <h2 className="text-slate-900 font-semibold mb-3">How to use this dashboard</h2>
            <ol className="space-y-2 text-sm text-slate-500">
              <li><span className="text-slate-900 font-medium">1. Choose an attack</span> — Click any card above to open the demo</li>
              <li><span className="text-slate-900 font-medium">2. Switch modes</span> — Toggle between &quot;Vulnerable&quot; and &quot;Secure&quot; to see the difference</li>
              <li><span className="text-slate-900 font-medium">3. Enter a payload</span> — Try the suggested payloads or create your own</li>
              <li><span className="text-slate-900 font-medium">4. Read the explanation</span> — Understand why the attack fails in secure mode</li>
            </ol>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
