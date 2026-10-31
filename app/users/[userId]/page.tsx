import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import UserDetailClient from './UserDetailClient';
import { 
  ArrowLeft, 
  Coins, 
  Sparkles, 
  Smartphone, 
  Laptop, 
  Calendar, 
  Layers, 
  History,
  HardDrive
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params;

  const userDoc = await adminDb.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    notFound();
  }

  const userData = userDoc.data() || {};
  const linkedUids = userData.linkedFirebaseUids || [];

  // Fetch last 30 transactions
  const txSnapshot = await adminDb
    .collection('users').doc(userId)
    .collection('transactions')
    .orderBy('createdAt', 'desc')
    .limit(30)
    .get();

  const transactions = txSnapshot.docs.map(doc => {
    const d = doc.data();
    return {
      id: doc.id,
      amount: Number(d.amount) || 0,
      type: d.type || 'unknown',
      description: d.description || 'No description provided',
      dateFormatted: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Recently',
    };
  });

  const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Unknown';

  const lastActiveAt = userData.lastActiveAt?.toDate ? userData.lastActiveAt.toDate().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Never';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back and Header */}
      <div>
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Users</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              User Overview
            </h1>
            <p className="font-mono text-xs text-indigo-400 mt-1">
              {userData.sharedUserId || userDoc.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
              userData.isBlocked
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {userData.isBlocked ? 'Blocked Account' : 'Active Account'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Info Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Credits */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Credit Balance</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {(userData.credits || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400">Available to spend</span>
        </div>

        {/* Subscription Tier */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Subscription Tier</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white capitalize mt-2">
            {userData.subscriptionTier || 'Free'}
          </div>
          <span className="text-[11px] text-slate-400">
            {userData.subscriptionEndDate?.toDate 
              ? `Renews ${userData.subscriptionEndDate.toDate().toLocaleDateString()}`
              : 'Standard Plan'}
          </span>
        </div>

        {/* Total Generations */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Generations</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {userData.totalGenerations || 0}
          </div>
          <span className="text-[11px] text-slate-400">Successful jobs</span>
        </div>

        {/* Platform & Activity */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Platform</span>
            {userData.platform === 'ios' ? <Smartphone className="w-4 h-4 text-slate-400" /> : <Laptop className="w-4 h-4 text-slate-400" />}
          </div>
          <div className="text-2xl font-bold text-white capitalize mt-2">
            {userData.platform || 'macos'}
          </div>
          <span className="text-[11px] text-slate-400 truncate block">
            Active: {lastActiveAt}
          </span>
        </div>
      </div>

      {/* Interactive Actions (Credits Adjustment & Block/Unblock) */}
      <UserDetailClient
        userId={userDoc.id}
        isBlocked={Boolean(userData.isBlocked)}
        blockReason={userData.blockReason || null}
        currentCredits={Number(userData.credits) || 0}
      />

      {/* Linked Devices & Accounts Info */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Cross-Device Identity Links</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          All Firebase Anonymous Auth UIDs associated with this shared iCloud / account document:
        </p>
        <div className="flex flex-wrap gap-2">
          {linkedUids.length === 0 ? (
            <span className="text-xs text-slate-400">No linked UIDs recorded.</span>
          ) : (
            linkedUids.map((uid: string) => (
              <span key={uid} className="font-mono text-xs px-3 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60">
                {uid}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Transactions & Activity Ledger Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Transaction & Usage Ledger</h2>
          </div>
          <span className="text-xs text-slate-400">{transactions.length} recent events</span>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No transactions or credit history recorded for this user yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Date & Time</th>
                  <th scope="col" className="px-4 py-2.5">Type</th>
                  <th scope="col" className="px-4 py-2.5">Amount</th>
                  <th scope="col" className="px-4 py-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {tx.dateFormatted}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        tx.amount > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {tx.description}
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
