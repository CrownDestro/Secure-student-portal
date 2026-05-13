'use client';

interface Props { password: string }

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (pw.length >= 12)             score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[a-z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[@$!%*?&#^()_+]/.test(pw)) score++;

  if (score <= 2) return { score, label: 'Weak',   color: 'bg-red-500'    };
  if (score <= 4) return { score, label: 'Fair',   color: 'bg-yellow-500' };
  if (score <= 5) return { score, label: 'Strong', color: 'bg-green-500'  };
  return           { score, label: 'Very Strong', color: 'bg-emerald-400' };
}

export default function PasswordStrength({ password }: Props) {
  if (!password) return null;
  const { score, label, color } = getStrength(password);
  const pct = Math.round((score / 6) * 100);

  return (
    <div className="mt-1 space-y-1">
      <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">
        Password strength: <span className={`font-medium ${score <= 2 ? 'text-red-400' : score <= 4 ? 'text-yellow-400' : 'text-green-400'}`}>{label}</span>
      </p>
      <ul className="text-xs text-slate-500 space-y-0.5 mt-1">
        {[
          [password.length >= 8,              '8+ characters'],
          [/[A-Z]/.test(password),            'Uppercase letter'],
          [/[a-z]/.test(password),            'Lowercase letter'],
          [/[0-9]/.test(password),            'Number'],
          [/[@$!%*?&#^()_+]/.test(password),  'Special character'],
        ].map(([ok, label], i) => (
          <li key={i} className={ok ? 'text-green-400' : 'text-slate-500'}>
            {ok ? '✓' : '○'} {label as string}
          </li>
        ))}
      </ul>
    </div>
  );
}
