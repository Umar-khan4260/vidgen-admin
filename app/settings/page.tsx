import { adminDb } from '@/lib/firebase-admin';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const configDoc = await adminDb.collection('admin').doc('config').get();
  const config = configDoc.data() || {};

  const initialConfig = {
    maintenanceMode: Boolean(config.maintenanceMode),
    maintenanceMessage: config.maintenanceMessage || 'The app is currently undergoing scheduled maintenance. Please check back shortly.',
    defaultCredits: Number(config.defaultCredits ?? config.freeCredits ?? 0) || 0,
    imageCreditFloor: Number(config.imageCreditFloor) || 40,
    videoCreditFloor: Number(config.videoCreditFloor) || 80,
    disabledModels: Array.isArray(config.disabledModels) ? config.disabledModels : [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          System Settings & Policies
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure app-wide policies, signup rewards, generation floors, and maintenance states.
        </p>
      </div>

      <SettingsClient initialConfig={initialConfig} />
    </div>
  );
}
