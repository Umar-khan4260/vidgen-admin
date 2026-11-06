"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adjustCreditsAction, toggleBlockAction, assignPlanAction } from './actions';
import { Coins, ShieldAlert, ShieldCheck, Loader2, Plus, Minus, AlertTriangle, Gift } from 'lucide-react';

interface Props {
  userId: string;
  isBlocked: boolean;
  blockReason: string | null;
  currentCredits: number;
  currentTier?: string;
}

export default function UserDetailClient({ userId, isBlocked, blockReason, currentCredits, currentTier = 'free' }: Props) {
  const router = useRouter();

  // Credit adjustment state
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditReason, setCreditReason] = useState<string>('');
  const [adjustType, setAdjustType] = useState<'grant' | 'deduct'>('grant');
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditMessage, setCreditMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Plan assignment state
  const [planTiers, setPlanTiers] = useState<'weekly' | 'monthly' | 'lifetime'>('weekly');
  const [planCredits, setPlanCredits] = useState<number>(500);
  const [planLoading, setPlanLoading] = useState(false);
  const [planMessage, setPlanMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Block state
  const [blockLoading, setBlockLoading] = useState(false);
  const [newReason, setNewReason] = useState(blockReason || '');

  const handleAdjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(creditAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      setCreditMessage({ text: 'Please enter a positive credit number', error: true });
      return;
    }

    setCreditLoading(true);
    setCreditMessage(null);

    const finalAmount = adjustType === 'grant' ? amountNum : -amountNum;
    const res = await adjustCreditsAction(userId, finalAmount, creditReason);

    setCreditLoading(false);
    if (res.success) {
      setCreditMessage({ text: `Successfully ${adjustType === 'grant' ? 'granted' : 'deducted'} ${amountNum} credits!` });
      setCreditAmount('');
      setCreditReason('');
      router.refresh();
    } else {
      setCreditMessage({ text: res.error || 'Failed to update credits', error: true });
    }
  };

  const handleToggleBlock = async () => {
    setBlockLoading(true);
    const nextBlockedState = !isBlocked;
    const res = await toggleBlockAction(userId, nextBlockedState, nextBlockedState ? newReason : undefined);

    setBlockLoading(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Failed to change block status');
    }
  };
  const handleAssignPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanMessage(null);

    const res = await assignPlanAction(userId, planTiers, planCredits);

    setPlanLoading(false);
    if (res.success) {
      setPlanMessage({ text: `Successfully assigned ${res.newTier} plan + ${res.newCredits} credits!`, error: false });
      setPlanTiers('weekly');
      setPlanCredits(500);
      router.refresh();
    } else {
      setPlanMessage({ text: res.error || 'Failed to assign plan', error: true });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card 1: Adjust Credits */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Adjust Credits</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Grant bonus credits or deduct credits with an automatic audit trail logged in transaction history.
        </p>

        <form onSubmit={handleAdjustCredits} className="space-y-4">
          {/* Grant vs Deduct Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => setAdjustType('grant')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                adjustType === 'grant'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Grant Bonus</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustType('deduct')}
              className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                adjustType === 'deduct'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Deduct Credits</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Amount ({adjustType === 'grant' ? '+Credits' : '-Credits'})
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              required
              placeholder="e.g. 50"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason / Memo (Logged to User Ledger)
            </label>
            <input
              type="text"
              placeholder="e.g. Promotional giveaway or support credit"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {creditMessage && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              creditMessage.error 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}>
              {creditMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={creditLoading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
              adjustType === 'grant'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            } disabled:opacity-50`}
          >
            {creditLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{adjustType === 'grant' ? 'Confirm & Grant Credits' : 'Confirm & Deduct Credits'}</span>
          </button>
        </form>
      </div>

      {/* Card: Assign Plan */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Assign Plan</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Grant a subscription plan to the user. Credits will be added to their balance.
        </p>

        <form onSubmit={handleAssignPlan} className="space-y-4">
          {/* Plan Selection */}
          <div className="grid grid-cols-3 gap-2 mb-4 p-1 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
    setPlanTiers('weekly');
    setPlanCredits(500);
  }}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                planTiers === 'weekly'
                  ? 'bg-indigo-600/90 text-white shadow-lg'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/60'
              }`}>
              <Loader2 className="w-3 h-3 text-white" /> Weekly
              <span className="text-[8px] text-white/80">500</span>
            </button>
            <button
              type="button"
              onClick={() => {
    setPlanTiers('monthly');
    setPlanCredits(2000);
  }}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                planTiers === 'monthly'
                  ? 'bg-violet-600/90 text-white shadow-lg'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/60'
              }`}>
              <Loader2 className="w-3 h-3 text-white" /> Monthly
              <span className="text-[8px] text-white/80">2000</span>
            </button>
            <button
              type="button"
              onClick={() => {
    setPlanTiers('lifetime');
    setPlanCredits(7500);
  }}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                planTiers === 'lifetime'
                  ? 'bg-amber-600/90 text-white shadow-lg'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/60'
              }`}>
              <Loader2 className="w-3 h-3 text-white" /> Lifetime
              <span className="text-[8px] text-white/80">7500</span>
            </button>
          </div>

          {/* Credits display shows the plan's default, but admin can override */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Credits to assign
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300">Amount:</span>
              <span className="font-bold text-amber-400">{planCredits}</span>
              <span className="text-xs text-slate-400"> credits</span>
            </div>
            <input
              type="number"
              step="any"
              min="0"
              value={planCredits}
              onChange={(e) => setPlanCredits(Math.max(0, Number(e.target.value)))}
              className="w-24 px-2 py-1 rounded bg-slate-800/70 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500 ml-2"
              disabled={planLoading}
              aria-label="Override default credits (optional)"
            />
          </div>

          <button
            type="submit"
            disabled={planLoading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2 bg-indigo-600/90 ${planLoading ? 'opacity-50' : ''}`}>
              {planLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{planLoading ? 'Assigning...' : 'Assign Plan'}</span>
            </button>
        </form>

        {planMessage && (
          <div className={`p-3 rounded-xl text-xs font-medium ${planMessage.error ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
            {planMessage.text}
          </div>
        )}
      </div>

      {/* Card 2: Account Access & Suspension */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {isBlocked ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h2 className="text-base font-semibold text-white">Account Status & Access</h2>
          </div>

          <div className={`p-4 rounded-xl border mb-5 ${
            isBlocked
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2 font-semibold text-sm">
              <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span>{isBlocked ? 'Account is Currently Blocked' : 'Account is Active and Authorized'}</span>
            </div>
            {isBlocked && (
              <p className="text-xs text-rose-300/80 mt-2">
                Reason shown in app: <span className="font-semibold text-white">"{blockReason || 'Suspended by admin'}"</span>
              </p>
            )}
          </div>

          {/* If blocking, can input custom reason */}
          {!isBlocked && (
            <div className="space-y-1 mb-4">
              <label className="block text-xs font-medium text-slate-300">
                Suspension Reason (Shown to user in app)
              </label>
              <input
                type="text"
                placeholder="e.g. Terms of service violation"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={handleToggleBlock}
            disabled={blockLoading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isBlocked
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
            } disabled:opacity-50`}
          >
            {blockLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isBlocked ? (
              <span>Restore & Unblock User</span>
            ) : (
              <span>Suspend & Block User</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
