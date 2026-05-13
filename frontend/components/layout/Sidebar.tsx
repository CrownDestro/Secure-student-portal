'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Shield, Users, FileUp, ScrollText,
  LogOut, ChevronRight, Zap, User
} from 'lucide-react';

const navByRole = {
  student: [
    { href: '/dashboard/student',      icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/attack-simulator',        icon: Zap,             label: 'Attack Simulator' },
    { href: '/profile',                 icon: User,            label: 'Profile' },
  ],
  teacher: [
    { href: '/dashboard/teacher',      icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/attack-simulator',        icon: Zap,             label: 'Attack Simulator' },
    { href: '/profile',                 icon: User,            label: 'Profile' },
  ],
  admin: [
    { href: '/dashboard/admin',        icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/admin',        icon: Users,           label: 'User Management' },
    { href: '/admin/audit',            icon: ScrollText,      label: 'Audit Logs' },
    { href: '/attack-simulator',        icon: Zap,             label: 'Attack Simulator' },
    { href: '/profile',                 icon: User,            label: 'Profile' },
  ],
};

const roleColors = {
  student: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  teacher: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  admin:   'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;
  const nav = navByRole[user.role];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Secure Portal</p>
            <p className="text-slate-500 text-xs">CyberSec Course</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
            {user.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <span className={cn('text-xs px-1.5 py-0.5 rounded border font-medium', roleColors[user.role])}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                active
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
