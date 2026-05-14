'use client';
import { cn } from '@/lib/utils';
import { Shield, ShieldOff, AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  children: React.ReactNode;
}

const severityStyles = {
  critical: 'border-rose-200 bg-rose-50',
  high:     'border-amber-200 bg-amber-50',
  medium:   'border-yellow-200 bg-yellow-50',
};

const severityBadge = {
  critical: 'bg-rose-100 text-rose-700 border-rose-200',
  high:     'bg-amber-100 text-amber-700 border-amber-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export default function AttackCard({ title, description, severity, children }: Props) {
  return (
    <div className={cn('rounded-2xl border p-6 bg-white shadow-[0_1px_1px_rgba(15,23,42,0.05)]', severityStyles[severity])}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className={cn('w-5 h-5', severity === 'critical' ? 'text-rose-600' : severity === 'high' ? 'text-amber-600' : 'text-yellow-600')} />
          <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded border uppercase tracking-wide', severityBadge[severity])}>
          {severity}
        </span>
      </div>
      <p className="text-slate-500 text-sm mb-5">{description}</p>
      {children}
    </div>
  );
}

export function ResultPanel({ blocked, explanation, extra, children }: { blocked: boolean; explanation: string; extra?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className={cn('mt-4 rounded-xl border p-4', blocked ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50')}>
      <div className="flex items-center gap-2 mb-2">
        {blocked
          ? <Shield className="w-4 h-4 text-emerald-600" />
          : <ShieldOff className="w-4 h-4 text-rose-600" />
        }
        <span className={cn('text-sm font-semibold', blocked ? 'text-emerald-700' : 'text-rose-700')}>
          {blocked ? 'Attack Blocked ✓' : '⚠️ Attack Would Succeed (Insecure Mode)'}
        </span>
      </div>
      <p className="text-slate-600 text-sm">{explanation}</p>
      {extra}
      {children}
    </div>
  );
}

export function CodeBlock({ label, code, variant = 'neutral' }: { label: string; code: string; variant?: 'danger' | 'safe' | 'neutral' }) {
  const colors = {
    danger:  'border-rose-200 bg-rose-50',
    safe:    'border-emerald-200 bg-emerald-50',
    neutral: 'border-slate-200 bg-slate-50',
  };
  return (
    <div className={cn('rounded-lg border overflow-hidden', colors[variant])}>
      <div className="px-3 py-1.5 border-b border-slate-200 bg-white/70">
        <span className="text-xs text-slate-600 font-mono">{label}</span>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
