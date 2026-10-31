export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import Link from 'next/link';
import { adminDb } from '@/lib/firebase-admin';
import { 
  Users, 
  Coins, 
  Sparkles, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  Gift,
  Layers,
  Loader2
} from 'lucide-react';

interface UserDoc {
  id: string;
  sharedUserId?: string;
  credits?: number;
  subscriptionTier?: string;
  isBlocked?: boolean;
  blockReason?: string;
  totalGenerations?: number;
  platform?: string;
  createdAt?: FirebaseFirestore.Timestamp;
  lastActiveAt?: FirebaseFirestore.Timestamp;
}

interface AdminConfig {
  maintenanceMode?: boolean;
  defaultCredits?: number;
  freeCredits?: number;
}

async function getDashboardData() {
  try {
    const usersSnap = await adminDb.collection('users').get();
    const users: UserDoc[] = usersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as UserDoc));

    const configSnap = await adminDb.collection('admin').doc('config').get();
    const config: AdminConfig = configSnap.exists ? (configSnap.data() as AdminConfig) : {};

    const totalUsers = users.length;
    const blockedUsers = users.filter(u => u.isBlocked).length;
    const activeUsers = totalUsers - blockedUsers;
    const totalCreditsInCirculation = users.reduce((sum, u) => sum + (Number(u.credits) || 0), 0);
    const totalGenerations = users.reduce((sum, u) => sum + (Number(u.totalGenerations) || 0), 0);

    const tiers = {
      free: users.filter(u => !u.subscriptionTier || u.subscriptionTier === 'free').length,
      weekly: users.filter(u => u.subscriptionTier === 'weekly').length,
      monthly: users.filter(u => u.subscriptionTier === 'monthly').length,
      lifetime: users.filter(u => u.subscriptionTier === 'lifetime').length,
    };

    const recentUsers = [...users].sort((a, b) => {
      const timeA = a.lastActiveAt?.toMillis() || a.createdAt?.toMillis() || 0;
      const timeB = b.lastActiveAt?.toMillis() || b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    }).slice(0, 6);

    return {
      totalUsers,
      blockedUsers,
      activeUsers,
      totalCreditsInCirculation,
      totalGenerations,
      tiers,
      recentUsers,
      config,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      blockedUsers: 0,
      activeUsers: 0,
      totalCreditsInCirculation: 0,
      totalGenerations: 0,
      tiers: { free: 0, weekly: 0, monthly: 0, lifetime: 0 },
      recentUsers: [],
      config: {},
    };
  }
}

async function DashboardContent() {
  const data = await getDashboardData();
  const maintenanceActive = data.config.maintenanceMode === true;
  const defaultFreeCredits = data.config.defaultCredits ?? data.config.freeCredits ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Overview Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics and user telemetry for VidGen AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700/60 transition-all"
          >
            <span>Settings</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">{data.totalUsers}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{data.activeUsers} active</span>
              <span>•</span>
              <span className="text-rose-400 font-medium">{data.blockedUsers} blocked</span>
            </div>
          </div>
        </div>

        {/* Total Credits in Circulation */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">User Credits Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">
              {data.totalCreditsInCirculation.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Circulating across all accounts
            </div>
          </div>
        </div>

        {/* Total Generations */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Generations</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-white tracking-tight">
              {data.totalGenerations.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Images & videos generated
            </div>
          </div>
        </div>

        {/* System Status / Maintenance */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Maintenance Mode</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${maintenanceActive ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {maintenanceActive ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${maintenanceActive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className={maintenanceActive ? 'text-rose-400' : 'text-emerald-400'}>
                {maintenanceActive ? 'ACTIVE (Locked)' : 'Normal Mode'}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {maintenanceActive ? 'Requests blocked for non-admins' : 'All systems operating normally'}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Subscription Breakdown & Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Subscription Tiers Breakdown</h2>
            </div>
            <span className="text-xs text-slate-400">{data.totalUsers} registered users</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Free Tier</div>
              <div className="text-2xl font-bold text-white mt-1">{data.tiers.free}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Pay-as-you-go</div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-xs text-indigo-300 font-medium">Weekly Plan</div>
              <div className="text-2xl font-bold text-indigo-200 mt-1">{data.tiers.weekly}</div>
              <div className="text-[11px] text-indigo-400/80 mt-0.5">500 credits / wk</div>
            </div>

            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <div className="text-xs text-violet-300 font-medium">Monthly Plan</div>
              <div className="text-2xl font-bold text-violet-200 mt-1">{data.tiers.monthly}</div>
              <div className="text-[11px] text-violet-400/80 mt-0.5">2,000 credits / mo</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-amber-300 font-medium">Lifetime Pack</div>
              <div className="text-2xl font-bold text-amber-200 mt-1">{data.tiers.lifetime}</div>
              <div className="text-[11px] text-amber-400/80 mt-0.5">7,500 credits pack</div>
            </div>
          </div>
        </div>

        {/* Live Admin Config Box */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Signup Policy</h2>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Configured in <code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded">admin/config</code>. New users automatically receive this balance upon first launch.
            </p>

            <div className="mt-5 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-xs text-slate-400">New User Free Bonus</span>
              <div className="text-3xl font-extrabold text-indigo-400 mt-1">
                {defaultFreeCredits} <span className="text-sm font-normal text-slate-400">credits</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Need to change this?</span>
            <Link href="/settings" className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Go to Settings &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Recent Users</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest active accounts connected to the system</p>
          </div>
          <Link
            href="/users"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all users &rarr;
          </Link>
        </div>

        {data.recentUsers.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No users registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/40 text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3 rounded-l-lg">User ID</th>
                  <th scope="col" className="px-4 py-3">Platform</th>
                  <th scope="col" className="px-4 py-3">Tier</th>
                  <th scope="col" className="px-4 py-3">Credits</th>
                  <th scope="col" className="px-4 py-3">Generations</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recentUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-white max-w-[200px] truncate">
                      {user.sharedUserId || user.id}
                    </td>
                    <td className="px-4 py-3 capitalize text-xs">
                      {user.platform || 'macos'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                        user.subscriptionTier === 'weekly' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : user.subscriptionTier === 'monthly'
                          ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                          : user.subscriptionTier === 'lifetime'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {user.subscriptionTier || 'Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {(user.credits || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.totalGenerations || 0}
                    </td>
                    <td className="px-4 py-3">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                          <ShieldAlert className="w-3.5 h-3.5" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/users/${user.id}`}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      <span className="text-sm font-medium">Loading live dashboard telemetry...</span>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
