'use client';
import { useAuth } from '@/hooks/useAuth';
import AuthGuard from '@/components/auth/AuthGuard';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Zap, FileUp, Clock } from 'lucide-react';
import Link from 'next/link';

function StudentDashboardInner() {
  const { user } = useAuth();

  const cards = [
    { icon: Shield, color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20',  title: 'Your Role',         value: 'Student',      sub: 'Limited access scope' },
    { icon: Clock,  color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Session Timeout', value: '15 min',        sub: 'JWT auto-expires' },
    { icon: Zap,    color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', title: 'Attack Demos',    value: '4 available',   sub: 'SQLi, XSS, CSRF, Upload' },
    { icon: FileUp, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  title: 'File Uploads',    value: 'Enabled',       sub: 'Max 5MB, images & PDF' },
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
    <div className="p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
        <p className="text-slate-400 mt-1">You&apos;re securely authenticated as a <span className="text-blue-400 font-medium">Student</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon: Icon, color, bg, title, value, sub }) => (
          <div key={title} className={`rounded-xl border p-5 ${bg}`}>
            <Icon className={`w-6 h-6 ${color} mb-3`} />
            <p className="text-slate-400 text-xs mb-1">{title}</p>
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/attack-simulator"
          className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-6 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-semibold">Attack Simulator</p>
            <p className="text-slate-400 text-sm">Try SQLi, XSS, CSRF & Upload demos</p>
          </div>
        </Link>
        <Link href="/profile"
          className="group flex items-center gap-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-xl p-6 transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-white font-semibold">My Profile</p>
            <p className="text-slate-400 text-sm">Update password & account settings</p>
          </div>
        </Link>
      </div>

      {/* Security features active */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-400" /> Active Security Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {securityFeatures.map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-slate-200 text-sm font-medium">{label}</p>
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
