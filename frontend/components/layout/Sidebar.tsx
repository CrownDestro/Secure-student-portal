'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutGrid, Shield, Users, FileUp, ScrollText,
  LogOut, ChevronRight, Sparkles, UserCircle2
} from 'lucide-react';

const navByRole = {
  student: [
    { href: '/dashboard/student',      icon: LayoutGrid,   label: 'Overview' },
    { href: '/attack-simulator',       icon: Sparkles,     label: 'Attack Lab' },
    { href: '/profile',                icon: UserCircle2,  label: 'Profile' },
  ],
  teacher: [
    { href: '/dashboard/teacher',      icon: LayoutGrid,   label: 'Overview' },
    { href: '/attack-simulator',       icon: Sparkles,     label: 'Attack Lab' },
    { href: '/profile',                icon: UserCircle2,  label: 'Profile' },
  ],
  admin: [
    { href: '/dashboard/admin',        icon: LayoutGrid,   label: 'Overview' },
    { href: '/dashboard/admin',        icon: Users,           label: 'User Management' },
    { href: '/admin/audit',            icon: ScrollText,      label: 'Audit Logs' },
    { href: '/attack-simulator',       icon: Sparkles,     label: 'Attack Lab' },
    { href: '/profile',                icon: UserCircle2,  label: 'Profile' },
  ],
};

const roleColors = {
  student: 'bg-sky-100 text-sky-700 border-sky-200',
  teacher: 'bg-violet-100 text-violet-700 border-violet-200',
  admin:   'bg-rose-100 text-rose-700 border-rose-200',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const nav = navByRole[user.role];

  return (
    <aside className="w-72 min-h-screen bg-white/95 border-r border-slate-200/80 backdrop-blur flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm leading-tight">Secure Portal</p>
            <p className="text-slate-500 text-xs">CyberSec Course</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="px-5 py-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 text-sm font-medium truncate">{user.name}</p>
            <span className={cn('text-[10px] px-2.5 py-0.5 rounded-full border font-semibold uppercase tracking-widest', roleColors[user.role])}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all',
                active
                  ? 'bg-slate-900 text-white font-medium shadow-[0_8px_18px_rgba(15,23,42,0.18)]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              )}
            >
              <Icon className={cn('w-[18px] h-[18px] flex-shrink-0', active ? 'text-white' : 'text-slate-500')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-rose-700 hover:bg-rose-50/70 transition-all"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
