'use client';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Zap, FileUp, Clock } from 'lucide-react';
import Link from 'next/link';

function StudentDashboardInner() {
  const { user } = useAuth();

  const cards = [
    { icon: Shield, color: 'text-sky-600',    accent: 'bg-sky-50 border-sky-200',    title: 'Your Role',         value: 'Student',      sub: 'Limited access scope' },
    { icon: Clock,  color: 'text-violet-600', accent: 'bg-violet-50 border-violet-200', title: 'Session Timeout', value: '15 min',        sub: 'JWT auto-expires' },
    { icon: Zap,    color: 'text-amber-600',  accent: 'bg-amber-50 border-amber-200', title: 'Attack Demos',    value: '4 available',   sub: 'SQLi, XSS, CSRF, Upload' },
    { icon: FileUp, color: 'text-emerald-600', accent: 'bg-emerald-50 border-emerald-200', title: 'File Uploads', value: 'Enabled',       sub: 'Max 5MB, images & PDF' },
  ];

  const securityFeatures = [
    { label: 'HTTP-only JWT Cookie',    desc: 'Token cannot be read by JavaScript — XSS-proof' },
    { label: 'SameSite=Strict Cookie',  desc: 'Prevents CSRF — cross-origin requests blocked' },
    { label: 'bcrypt Password Hashing', desc: 'Cost factor 12 — brute-force resistant' },
    { label: 'Input Validation',        desc: 'All inputs validated by Zod (frontend) + express-validator (backend)' },
    { label: 'Rate Limiting',           desc: '5 login attempts per 15 min — account lockout enabled' },
    { label: 'Audit Logging',           desc: 'Every action logged with IP, timestamp, and status' },
  ];

  return (
    <div className="px-8 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mt-1">You&apos;re securely authenticated as a <span className="text-sky-600 font-medium">Student</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon: Icon, color, accent, title, value, sub }) => (
          <div key={title} className="card p-5">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border ${accent}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-slate-500 text-xs mb-1">{title}</p>
            <p className="text-slate-900 font-semibold text-xl">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/attack-simulator"
          className="group card flex items-center gap-4 p-6 transition-all hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
            <Zap className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold">Attack Simulator</p>
            <p className="text-slate-500 text-sm">Try SQLi, XSS, CSRF & Upload demos</p>
          </div>
        </Link>
        <Link href="/profile"
          className="group card flex items-center gap-4 p-6 transition-all hover:border-slate-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
            <Shield className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-slate-900 font-semibold">My Profile</p>
            <p className="text-slate-500 text-sm">Update password & account settings</p>
          </div>
        </Link>
      </div>

      {/* Security features active */}
      <div className="card p-6">
        <h2 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" /> Active Security Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {securityFeatures.map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
              <div>
                <p className="text-slate-800 text-sm font-medium">{label}</p>
                <p className="text-slate-500 text-xs">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <AuthGuard allowedRoles={['student']}>
      <DashboardLayout>
        <StudentDashboardInner />
      </DashboardLayout>
    </AuthGuard>
  );
}
