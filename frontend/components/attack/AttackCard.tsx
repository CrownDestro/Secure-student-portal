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
  critical: 'border-red-500/40 bg-red-500/5',
  high:     'border-orange-500/40 bg-orange-500/5',
  medium:   'border-yellow-500/40 bg-yellow-500/5',
};

const severityBadge = {
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  high:     'bg-orange-500/20 text-orange-300 border-orange-500/30',
  medium:   'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};

export default function AttackCard({ title, description, severity, children }: Props) {
  return (
    <div className={cn('rounded-xl border p-6', severityStyles[severity])}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className={cn('w-5 h-5', severity === 'critical' ? 'text-red-400' : severity === 'high' ? 'text-orange-400' : 'text-yellow-400')} />
          <h3 className="font-semibold text-white text-lg">{title}</h3>
        </div>
        <span className={cn('text-xs font-medium px-2 py-1 rounded border uppercase tracking-wide', severityBadge[severity])}>
          {severity}
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-5">{description}</p>
      {children}
    </div>
  );
}

export function ResultPanel({ blocked, explanation, extra, children }: { blocked: boolean; explanation: string; extra?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className={cn('mt-4 rounded-lg border p-4', blocked ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5')}>
      <div className="flex items-center gap-2 mb-2">
        {blocked
          ? <Shield className="w-4 h-4 text-green-400" />
          : <ShieldOff className="w-4 h-4 text-red-400" />
        }
        <span className={cn('text-sm font-semibold', blocked ? 'text-green-400' : 'text-red-400')}>
          {blocked ? 'Attack Blocked ✓' : '⚠️ Attack Would Succeed (Insecure Mode)'}
        </span>
      </div>
      <p className="text-slate-300 text-sm">{explanation}</p>
      {extra}
      {children}
    </div>
  );
}

export function CodeBlock({ label, code, variant = 'neutral' }: { label: string; code: string; variant?: 'danger' | 'safe' | 'neutral' }) {
  const colors = {
    danger:  'border-red-500/30 bg-red-950/30',
    safe:    'border-green-500/30 bg-green-950/30',
    neutral: 'border-slate-700 bg-slate-900',
  };
  return (
    <div className={cn('rounded-lg border overflow-hidden', colors[variant])}>
      <div className="px-3 py-1.5 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xs text-slate-400 font-mono">{label}</span>
      </div>
      <pre className="p-4 text-sm font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
