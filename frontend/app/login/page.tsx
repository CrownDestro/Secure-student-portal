'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { loginSchema, LoginInput } from '@/lib/validators';
import { api } from '@/lib/api';
import { User } from '@/types';

export default function LoginPage() {
  const [showPw, setShowPw]   = useState(false);
  const [error,  setError]    = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ user: User }>('/api/auth/login', data);
      router.push(`/dashboard/${res.user.role}`);
    } catch (err: unknown) {
      const e = err as { error?: string };
      setError(e.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Secure Student Portal</h1>
          <p className="text-slate-400 text-sm mt-1">23CSE313 – Foundations of Cyber Security</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2.5">
              <Lock className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                Protected by JWT in HTTP-only cookie. 5 failed attempts will lock your account for 15 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create one</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">Demo Credentials</p>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <p>student@demo.com  / Student@123</p>
            <p>teacher@demo.com  / Teacher@123</p>
            <p>admin@demo.com    / Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
