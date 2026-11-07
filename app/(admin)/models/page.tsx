import { adminDb } from '@/lib/firebase-admin';
import ModelsClient from './ModelsClient';

export const dynamic = 'force-dynamic';

export default async function ModelsPage() {
  const configDoc = await adminDb.collection('admin').doc('config').get();
  const config = configDoc.data() || {};

  const disabledModels = Array.isArray(config.disabledModels)
    ? config.disabledModels.filter(
        (id: unknown): id is string => typeof id === 'string'
      )
    : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Model Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Enable or disable the AI models served by the backend. Disabled models
          are blocked on every generation and chat request, and are hidden from
          the app&apos;s model lists.
        </p>
      </div>

      <ModelsClient initialDisabledModels={disabledModels} />
    </div>
  );
}
