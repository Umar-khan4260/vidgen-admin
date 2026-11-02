import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { isAdminAuthenticated } from '@/lib/admin-session';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in — VidGen AI Admin',
};

export default async function LoginPage() {
  if (await isAdminAuthenticated()) redirect('/');

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/40">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VidGen AI
              </h1>
              <span className="text-[11px] font-medium text-indigo-400 tracking-wide uppercase">
                Admin Portal
              </span>
            </div>
          </div>

          <LoginForm />

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Authorized personnel only — sessions expire after 12 hours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
