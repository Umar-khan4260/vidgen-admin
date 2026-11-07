"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateModelsAction } from './actions';
import {
  MODEL_CATALOG,
  MODEL_CATEGORIES,
  type CatalogModel,
  type ModelCategory,
} from '@/lib/model-catalog';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Loader2,
  RotateCcw,
  Save,
  Search,
} from 'lucide-react';

interface ModelsClientProps {
  initialDisabledModels: string[];
}

const CATEGORY_LABEL: Record<ModelCategory, string> = MODEL_CATEGORIES.reduce(
  (acc, category) => {
    acc[category.key] = category.label;
    return acc;
  },
  {} as Record<ModelCategory, string>
);

const sortIds = (ids: string[]) => [...ids].sort().join('|');

export default function ModelsClient({
  initialDisabledModels,
}: ModelsClientProps) {
  const router = useRouter();

  const [disabledModels, setDisabledModels] = useState<string[]>(
    initialDisabledModels || []
  );
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    error?: boolean;
  } | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const disabledModelSet = useMemo(
    () => new Set(disabledModels),
    [disabledModels]
  );

  const visibleGroups = useMemo(() => {
    const query = modelSearch.trim().toLowerCase();
    return MODEL_CATEGORIES.map((category) => ({
      ...category,
      models: MODEL_CATALOG.filter(
        (model) =>
          model.category === category.key &&
          (!query ||
            model.name.toLowerCase().includes(query) ||
            model.id.toLowerCase().includes(query))
      ),
    })).filter((group) => group.models.length > 0);
  }, [modelSearch]);

  const knownDisabledCount = disabledModels.filter((id) =>
    MODEL_CATALOG.some((model) => model.id === id)
  ).length;
  const enabledCount = MODEL_CATALOG.length - knownDisabledCount;
  const isSearching = modelSearch.trim().length > 0;
  const allExpanded = MODEL_CATEGORIES.every((category) =>
    expandedCategories.has(category.key)
  );
  const hasChanges =
    sortIds(disabledModels) !== sortIds(initialDisabledModels || []);

  const toggleModel = (modelId: string) => {
    setDisabledModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((m) => m !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) {
        next.delete(categoryKey);
      } else {
        next.add(categoryKey);
      }
      return next;
    });
  };

  const setCategoryEnabled = (models: CatalogModel[], enabled: boolean) => {
    const ids = models.map((model) => model.id);
    setDisabledModels((prev) =>
      enabled
        ? prev.filter((id) => !ids.includes(id))
        : Array.from(new Set([...prev, ...ids]))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const res = await updateModelsAction({ disabledModels });

    setSaving(false);
    if (res.success) {
      setStatusMsg({
        text: 'Model availability saved. The backend enforces this within ~30 seconds and the app hides disabled models on its next refresh.',
      });
      router.refresh();
    } else {
      setStatusMsg({
        text: res.error || 'Failed to save model availability',
        error: true,
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Status toast */}
      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2 ${
            statusMsg.error
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {statusMsg.error ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
          <div className="text-[11px] font-medium text-emerald-300 uppercase tracking-wide">
            Enabled
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {enabledCount}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-4">
          <div className="text-[11px] font-medium text-rose-300 uppercase tracking-wide">
            Disabled
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {knownDisabledCount}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
            Total models
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            {MODEL_CATALOG.length}
          </div>
        </div>
      </div>

      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">
              AI Model Catalogue
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Grouped by capability. Models shared across modes are disabled
              everywhere.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${MODEL_CATALOG.length} models by name or ID...`}
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              setExpandedCategories(
                allExpanded
                  ? new Set()
                  : new Set(MODEL_CATEGORIES.map((category) => category.key))
              )
            }
            className="shrink-0 px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-indigo-500/50 transition-all"
          >
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        {knownDisabledCount > 0 && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-rose-500/5 border border-rose-500/20 px-3.5 py-2">
            <span className="text-xs text-rose-300">
              {knownDisabledCount} model(s) disabled
            </span>
            <button
              type="button"
              onClick={() => setDisabledModels([])}
              className="text-[11px] font-semibold text-rose-300 hover:text-white transition-colors"
            >
              Enable all
            </button>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {visibleGroups.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No models match &ldquo;{modelSearch}&rdquo;.
            </div>
          )}

          {visibleGroups.map((group) => {
            const isOpen = isSearching || expandedCategories.has(group.key);
            const disabledInGroup = group.models.filter((model) =>
              disabledModelSet.has(model.id)
            ).length;
            const allDisabled = disabledInGroup === group.models.length;

            return (
              <div
                key={group.key}
                className="rounded-xl border border-slate-800/80 overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 bg-slate-800/40 px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.key)}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white whitespace-nowrap">
                      {group.label}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate hidden sm:block">
                      {group.description}
                    </span>
                    <span className="ml-auto text-[10px] font-medium text-slate-400 whitespace-nowrap">
                      {group.models.length - disabledInGroup}/
                      {group.models.length}
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setCategoryEnabled(group.models, true)}
                      disabled={disabledInGroup === 0}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Enable all
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryEnabled(group.models, false)}
                      disabled={allDisabled}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Disable all
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                    {group.models.map((model) => {
                      const isDisabled = disabledModelSet.has(model.id);
                      return (
                        <div
                          key={model.id}
                          className={`p-3 rounded-xl border flex items-start justify-between gap-2 transition-colors ${
                            isDisabled
                              ? 'bg-rose-500/5 border-rose-500/20'
                              : 'bg-slate-800/40 border-slate-700/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div
                              className={`text-xs font-semibold truncate ${
                                isDisabled ? 'text-slate-400' : 'text-white'
                              }`}
                              title={model.name}
                            >
                              {model.name}
                            </div>
                            <div
                              className="text-[10px] font-mono text-slate-400 truncate"
                              title={model.id}
                            >
                              {model.id}
                            </div>
                            {model.alsoUsedIn &&
                              model.alsoUsedIn.length > 0 && (
                                <div className="text-[10px] text-indigo-400/80 mt-1 truncate">
                                  Also in{' '}
                                  {model.alsoUsedIn
                                    .map((c) => CATEGORY_LABEL[c])
                                    .join(', ')}
                                </div>
                              )}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleModel(model.id)}
                            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                              isDisabled
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isDisabled ? 'Disabled' : 'Enabled'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {hasChanges && (
          <button
            type="button"
            onClick={() => setDisabledModels(initialDisabledModels || [])}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 text-sm font-semibold hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Discard Changes</span>
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !hasChanges}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}
