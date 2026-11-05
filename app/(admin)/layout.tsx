import Link from "next/link";
import { LayoutDashboard, Users, Settings, Sparkles, Activity, LogOut } from "lucide-react";
import { logoutAction } from "./actions";

/** Shell for all authenticated admin pages: fixed sidebar + internally
 * scrolling content column. The old top header bar ("Production Control
 * Center" / "Phase 5 Admin Panel") was removed on request. */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Logo & Title */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                VidGen AI
              </h1>
              <span className="text-[11px] font-medium text-indigo-400 tracking-wide uppercase">Admin Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all group"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/users"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all group"
            >
              <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>Users &amp; Credits</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all group"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>App Settings</span>
            </Link>
          </nav>
        </div>

        {/* Bottom: Sign out + Database status */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all group cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              <span>Sign out</span>
            </button>
          </form>

          <div className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Database
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Project: <span className="text-slate-300 font-mono">vidgen-ai-backend</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area (the only scrolling container) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
