"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlanData, 
  togglePlanStatusAction, 
  updatePlanAction, 
  seedDefaultPlansAction 
} from './actions';
import { 
  Sparkles, 
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
  ExternalLink,
  Plus,
  Trash2,
  Check
} from 'lucide-react';

interface Props {
  initialPlans: PlanData[];
}

export default function PlansClient({ initialPlans }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanData[]>(initialPlans);
  const [editingPlan, setEditingPlan] = useState<PlanData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Form state for modal
  const [formData, setFormData] = useState<Partial<PlanData>>({});
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState('');

  const activePlansCount = plans.filter(p => p.isActive).length;
  const totalCreditsCapacity = plans.reduce((acc, p) => acc + (p.credits || 0), 0);

  const handleOpenEdit = (plan: PlanData) => {
    setEditingPlan(plan);
    setFormData({
      displayName: plan.displayName,
      description: plan.description,
      credits: plan.credits,
      price: plan.price,
      currency: plan.currency,
      days: plan.days,
      productId: plan.productId,
      badge: plan.badge,
      type: plan.type,
      isActive: plan.isActive,
    });
    setFeaturesList([...(plan.features || [])]);
    setNewFeatureText('');
  };

  const handleCloseEdit = () => {
    setEditingPlan(null);
    setFormData({});
    setFeaturesList([]);
    setNewFeatureText('');
  };

  const handleToggleActive = async (plan: PlanData) => {
    const nextState = !plan.isActive;
    setIsTogglingId(plan.id);
    setStatusMessage(null);

    // Optimistic update
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: nextState } : p));

    const res = await togglePlanStatusAction(plan.id, nextState);
    setIsTogglingId(null);

    if (res.success) {
      setStatusMessage({ text: `Plan "${plan.displayName}" status updated to ${nextState ? 'Active' : 'Disabled'}.` });
      router.refresh();
    } else {
      // Revert optimistic update
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: !nextState } : p));
      setStatusMessage({ text: res.error || 'Failed to update plan status.', error: true });
    }
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeaturesList(prev => [...prev, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeaturesList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setIsSaving(true);
    setStatusMessage(null);

    const payload: Partial<PlanData> = {
      ...formData,
      features: featuresList,
    };

    const res = await updatePlanAction(editingPlan.id, payload);
    setIsSaving(false);

    if (res.success) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? { ...p, ...payload, features: featuresList } as PlanData : p));
      setStatusMessage({ text: `Plan "${formData.displayName || editingPlan.displayName}" successfully updated in Firebase!` });
      handleCloseEdit();
      router.refresh();
    } else {
      setStatusMessage({ text: res.error || 'Failed to save plan changes.', error: true });
    }
  };

  const handleReSeed = async () => {
    if (!confirm('Re-sync default plans in Firebase? This will refresh all standard plan tiers.')) return;
    setIsSeeding(true);
    setStatusMessage(null);

    const res = await seedDefaultPlansAction();
    setIsSeeding(false);

    if (res.success) {
      setStatusMessage({ text: 'Standard plans successfully re-synced in Firestore!' });
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
            Real-time subscription tiers and credit packs fetched directly from Firebase Firestore (<code className="text-indigo-300">plans</code> collection).
          </p>
        </div>

        <button
          onClick={handleReSeed}
          disabled={isSeeding}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 shadow-sm transition-all disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> : <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />}
          <span>Re-sync Defaults</span>
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

      {/* Plans Cards Grid — 3 purchasable plans only (Free tier is managed via Settings) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isToggling = isTogglingId === plan.id;
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
                {/* Card Top: Badge + Status Toggle */}
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

                  <button
                    onClick={() => handleToggleActive(plan)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                    title="Toggle active status in App Store and backend"
                  >
                    {isToggling ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    )}
                    <span>{plan.isActive ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>

                {/* Plan Title & Price */}
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
                    <span className="font-medium text-slate-300">
                      {plan.days ? `${plan.days} days recurring` : 'No expiration'}
                    </span>
                  </div>
                </div>

                {/* Features Checklist */}
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
                  <span>Configure Plan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Edit Plan:</span>
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
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName || ''}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Badge Tag (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, Best Value"
                    value={formData.badge || ''}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Price (USD $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price ?? 0}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Credits Assigned
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.credits ?? 0}
                    onChange={e => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Null for lifetime"
                    value={formData.days ?? ''}
                    onChange={e => setFormData({ ...formData, days: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Apple StoreKit Product ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. com.vidgen.subscription.weekly"
                  value={formData.productId || ''}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Features List Builder */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Plan Bullet Features
                </label>
                <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                  {featuresList.map((f, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-200">
                      <span className="truncate">{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a plan feature bullet..."
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isActive)}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span className="text-xs text-slate-300 font-medium">
                  {formData.isActive ? 'Active and purchasable in app' : 'Disabled (hidden from store)'}
                </span>
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
                  <span>Save Plan Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

