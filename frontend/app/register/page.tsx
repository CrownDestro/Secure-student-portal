'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { registerSchema, RegisterInput } from '@/lib/validators';
import PasswordStrength from '@/components/auth/PasswordStrength';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [showPw, setShowPw]     = useState(false);
  const [error,  setError]      = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/auth/register', {
        name:     data.name,
        email:    data.email,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      const e = err as { error?: string; errors?: Array<{ msg: string }> };
      setError(e.error || e.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, icon: Icon, name, type = 'text', placeholder, extra }: {
    label: string; icon: React.ElementType; name: keyof RegisterInput;
    type?: string; placeholder: string; extra?: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
      {extra}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Student Portal</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="Full Name"       icon={User}  name="name"            placeholder="John Doe" />
            <Field label="Email Address"   icon={Mail}  name="email"           placeholder="you@example.com" />
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, upper, lower, number, symbol"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              <PasswordStrength password={password} />
            </div>
            <Field label="Confirm Password" icon={Lock} name="confirmPassword" type="password" placeholder="Repeat your password" />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors text-sm mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
