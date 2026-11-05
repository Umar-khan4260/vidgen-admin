'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm({ destination = '/' }: { destination?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Invalid email or password.');
        return;
      }

      window.location.href = result.redirectTo;
    } catch {
      setError('Unable to sign in. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="next" value={destination} />
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
          Admin Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@vidgen.ai"
          className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-300">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-400 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
