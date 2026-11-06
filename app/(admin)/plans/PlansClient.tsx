"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlanData,
  updatePlanAction,
  seedDefaultPlansAction,
} from './actions';
import {
  Coins,
  Calendar,
  ShieldCheck,
  Layers,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  RotateCcw,
  Loader2,
  Check,
} from 'lucide-react';

interface Props {
  initialPlans: PlanData[];
}

interface EditForm {
  credits: number;
  price: number;
}

export default function PlansClient({ initialPlans }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanData[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Form state for modal — only credits + price are editable
  const [formData, setFormData] = useState<EditForm>({ credits: 0, price: 0 });

  const activePlansCount = plans.filter(p => p.isActive).length;

  const handleOpenEdit = (plan: PlanData) => {
    setEditingPlan(plan);
    setFormData({
      credits: plan.credits,
      price: plan.price,
    });
  };

  const handleCloseEdit = () => {
    setEditingPlan(null);
    setFormData({ credits: 0, price: 0 });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload: Partial<PlanData> = {
      credits: formData.credits,
      price: formData.price,
    };

    const res = await updatePlanAction(editingPlan.id, payload);
    setIsSaving(false);

    if (res.success) {
      setPlans(prev =>
        prev.map(p =>
          p.id === editingPlan.id
            ? { ...p, credits: formData.credits, price: formData.price }
            : p
        )
      );
      setStatusMessage({
        text: `Plan "${editingPlan.displayName}" updated — ${formData.credits} credits at $${formData.price.toFixed(2)}.`,
      });
      handleCloseEdit();
      router.refresh();
    } else {
      setStatusMessage({ text: res.error || 'Failed to save plan changes.', error: true });
    }
  };

  const handleReSeed = async () => {
    if (!confirm('Write the default plans into Firebase? This creates/refreshes the plans collection.')) return;
    setIsSeeding(true);
    setStatusMessage(null);

    const res = await seedDefaultPlansAction();
    setIsSeeding(false);

    if (res.success) {
      setStatusMessage({ text: 'Default plans written to the Firestore plans collection!' });
      router.refresh();
    } else {
      setStatusMessage({ text: res.error || 'Failed to re-sync plans.', error: true });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Subscription & Credit Plans</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Subscription tiers and credit packs fetched from Firebase Firestore (<code className="text-indigo-300">plans</code> collection).
          </p>
        </div>

        <button
          onClick={handleReSeed}
          disabled={isSeeding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow-sm transition-all disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />}
          <span>Write Defaults to Firebase</span>
        </button>
      </div>

      {/* Status Toast */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 ${
          statusMessage.error
            ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
        }`}>
          {statusMessage.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Plans</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-white tracking-tight">{plans.length}</div>
            <div className="text-xs text-slate-400 mt-1">Configured in Firestore</div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active In Store</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-emerald-400 tracking-tight">
              {activePlansCount} <span className="text-sm font-normal text-slate-400">/ {plans.length}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Available for in-app purchase</div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Max Credit Pack</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-amber-300 tracking-tight">7,500</div>
            <div className="text-xs text-slate-400 mt-1">Lifetime non-expiring pack</div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">StoreKit Product Sync</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Apple Verified</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">com.vidgen.*</div>
          </div>
        </div>
      </div>

      {/* Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isWeekly = plan.tier === 'weekly';
          const isMonthly = plan.tier === 'monthly';
          const isLifetime = plan.tier === 'lifetime';

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between p-6 relative ${
                !plan.isActive
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-60'
                  : isMonthly
                  ? 'bg-slate-900/80 border-indigo-500/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                  : isWeekly
                  ? 'bg-slate-900/60 border-slate-800/90'
                  : isLifetime
                  ? 'bg-slate-900/60 border-amber-500/20'
                  : 'bg-slate-900/50 border-slate-800/80'
              }`}
            >
              <div>
                {/* Card Top: Badge + Status (read-only) */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  {plan.badge ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isMonthly
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : isLifetime
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isWeekly
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {plan.badge}
                    </span>
                  ) : <span />}

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{plan.isActive ? 'Active' : 'Disabled'}</span>
                  </span>
                </div>

                {/* Plan Title & Description */}
                <h3 className="text-lg font-bold text-white tracking-tight">{plan.displayName}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">{plan.description}</p>

                <div className="mt-5 pb-5 border-b border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      ${plan.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {plan.days ? `/${plan.days} days` : '/ one-time'}
                    </span>
                  </div>

                  {/* Credits Highlight */}
                  <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-white">{plan.credits.toLocaleString()}</span>
                      <span className="text-slate-400"> credits granted</span>
                    </div>
                  </div>
                </div>

                {/* Product ID & Details */}
                <div className="py-4 space-y-2.5 text-xs text-slate-400">
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Product ID</span>
                    <code className="text-[11px] font-mono text-indigo-300 break-all bg-slate-800/60 px-1.5 py-0.5 rounded">
                      {plan.productId || 'none (default tier)'}
                    </code>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Type:</span>
                    <span className="capitalize font-medium text-slate-300">{plan.type.replace('_', ' ')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Cycle:</span>
                    <span className="font-medium text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {plan.days ? `${plan.days} days recurring` : 'No expiration'}
                    </span>
                  </div>
                </div>

                {/* Features Checklist (read-only) */}
                {plan.features && plan.features.length > 0 && (
                  <div className="pt-2 pb-4 space-y-2 border-t border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Included Features
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800/80 mt-4">
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/70 hover:bg-slate-700/80 text-white border border-slate-700/60 transition-all hover:border-indigo-500/50"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Update Credits & Price</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal — only credits + price */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Update Plan:</span>
                  <span className="text-indigo-400">{editingPlan.displayName}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Firestore ID: <code className="text-slate-300 font-mono">plans/{editingPlan.id}</code>
                </p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credits Assigned
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Price (USD $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
