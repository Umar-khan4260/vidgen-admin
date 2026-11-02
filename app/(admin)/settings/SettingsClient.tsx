"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSystemConfigAction } from './actions';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Gift, 
  ShieldCheck, 
  Sliders, 
  Save, 
  Loader2, 
  Video, 
  Image as ImageIcon,
  Cpu
} from 'lucide-react';

interface ConfigData {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultCredits: number;
  imageCreditFloor: number;
  videoCreditFloor: number;
  disabledModels: string[];
}

const POPULAR_MODELS = [
  { id: 'kling-2.6/text-to-video', name: 'Kling 2.6 (Video)', type: 'video' },
  { id: 'grok-imagine/text-to-video', name: 'Grok Imagine (Video)', type: 'video' },
  { id: 'bytedance/seedance-1.5-pro', name: 'Seedance 1.5 Pro (Video)', type: 'video' },
  { id: 'flux/schnell', name: 'Flux Schnell (Image)', type: 'image' },
  { id: 'midjourney/v6-1', name: 'Midjourney v6.1 (Image)', type: 'image' },
  { id: 'gpt-5-2', name: 'GPT-5.2 (Chat)', type: 'chat' },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro (Chat)', type: 'chat' },
];

export default function SettingsClient({ initialConfig }: { initialConfig: ConfigData }) {
  const router = useRouter();

  const [maintenanceMode, setMaintenanceMode] = useState(initialConfig.maintenanceMode);
  const [maintenanceMessage, setMaintenanceMessage] = useState(initialConfig.maintenanceMessage);
  const [defaultCredits, setDefaultCredits] = useState<number>(initialConfig.defaultCredits);
  const [imageFloor, setImageFloor] = useState<number>(initialConfig.imageCreditFloor);
  const [videoFloor, setVideoFloor] = useState<number>(initialConfig.videoCreditFloor);
  const [disabledModels, setDisabledModels] = useState<string[]>(initialConfig.disabledModels || []);

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const toggleModel = (modelId: string) => {
    setDisabledModels(prev => 
      prev.includes(modelId) ? prev.filter(m => m !== modelId) : [...prev, modelId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    const res = await updateSystemConfigAction({
      maintenanceMode,
      maintenanceMessage,
      defaultCredits: Number(defaultCredits) || 0,
      imageCreditFloor: Number(imageFloor) || 40,
      videoCreditFloor: Number(videoFloor) || 80,
      disabledModels,
    });

    setSaving(false);
    if (res.success) {
      setStatusMsg({ text: 'Settings successfully updated and active across backend and mobile apps!' });
      router.refresh();
    } else {
      setStatusMsg({ text: res.error || 'Failed to save settings', error: true });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Toast message */}
      {statusMsg && (
        <div className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2 ${
          statusMsg.error 
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}>
          {statusMsg.error ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* 1. Maintenance Mode Section */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              maintenanceMode ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              {maintenanceMode ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">System Maintenance Mode</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Instantly restricts generation and chat APIs for non-admin users.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
          </label>
        </div>

        {maintenanceMode && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
            <label className="block text-xs font-medium text-rose-300">
              Notice Displayed in Flutter App During Maintenance
            </label>
            <input
              type="text"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-rose-500/30 text-white text-sm focus:outline-none focus:border-rose-500"
            />
          </div>
        )}
      </section>

      {/* 2. New User Signup Policy Section */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">New User Signup Policy</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Decide how many free credits new users receive automatically upon first app launch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Free Welcome Bonus Credits
            </label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={defaultCredits}
                onChange={(e) => setDefaultCredits(parseInt(e.target.value) || 0)}
                className="w-32 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">
                credits assigned on account creation
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Set to <code className="text-slate-300">0</code> for zero free credits (purchases required).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Pre-Generation Credit Floors */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Balance Thresholds (Pre-Generation Floors)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Minimum account balance required BEFORE launching a generation job.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Image Generation Floor</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={imageFloor}
                onChange={(e) => setImageFloor(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">credits required</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 mb-2">
              <Video className="w-4 h-4 text-violet-400" />
              <span>Video Generation Floor</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                value={videoFloor}
                onChange={(e) => setVideoFloor(parseInt(e.target.value) || 0)}
                className="w-28 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">credits required</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Model Availability Toggles */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Model Availability Toggles</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enable or disable specific AI models from being served by the backend proxy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {POPULAR_MODELS.map(model => {
            const isDisabled = disabledModels.includes(model.id);
            return (
              <div 
                key={model.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isDisabled 
                    ? 'bg-rose-500/5 border-rose-500/20 text-slate-400' 
                    : 'bg-slate-800/40 border-slate-700/50 text-white'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold">{model.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">{model.id}</div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
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
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
}
