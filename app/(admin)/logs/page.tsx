import { adminDb } from '@/lib/firebase-admin';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import LogsClient, { LogEntry } from './LogsClient';

export const dynamic = 'force-dynamic';

function formatDate(value: unknown): { formatted: string; ms: number } {
  try {
    const raw = value as { toDate?: () => Date } | Date | number | string | null | undefined;
    const date =
      raw && typeof raw === 'object' && 'toDate' in raw && typeof raw.toDate === 'function'
        ? raw.toDate()
        : raw
        ? new Date(raw as Date | number | string)
        : null;
    if (!date || isNaN(date.getTime())) return { formatted: 'Recently', ms: 0 };
    return {
      formatted: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      ms: date.getTime(),
    };
  } catch {
    return { formatted: 'Recently', ms: 0 };
  }
}

/** Read every user's transactions subcollection, a few users at a time so we
 *  never fire hundreds of concurrent Firestore requests at once. */
async function loadAllLogs(): Promise<LogEntry[]> {
  try {
    const usersSnap = await adminDb.collection('users').limit(200).get();

    const displayIdByUser = new Map<string, string>();
    for (const userDoc of usersSnap.docs) {
      displayIdByUser.set(userDoc.id, userDoc.data()?.sharedUserId || userDoc.id);
    }

    const docs: QueryDocumentSnapshot<DocumentData>[] = [];
    const CHUNK_SIZE = 10;

    for (let i = 0; i < usersSnap.docs.length; i += CHUNK_SIZE) {
      const chunk = usersSnap.docs.slice(i, i + CHUNK_SIZE);
      const results = await Promise.all(
        chunk.map(userDoc =>
          userDoc.ref
            .collection('transactions')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get()
            .then(snap => snap.docs)
            .catch(() => [] as QueryDocumentSnapshot<DocumentData>[])
        )
      );
      for (const result of results) {
        docs.push(...result);
      }
    }

    const entries: LogEntry[] = docs.map(doc => {
      const d = doc.data();
      const userId = doc.ref.parent?.parent?.id || 'unknown';
      const { formatted, ms } = formatDate(d.createdAt);
      return {
        id: doc.id,
        userId,
        sharedUserId: displayIdByUser.get(userId) || userId,
        amount: Number(d.amount) || 0,
        type: d.type || 'unknown',
        description: d.description || 'No description provided',
        dateFormatted: formatted,
        createdAtMs: ms,
      };
    });

    // Newest first.
    entries.sort((a, b) => b.createdAtMs - a.createdAtMs);
    return entries;
  } catch (err) {
    console.error('loadAllLogs error:', err);
    return [];
  }
}

export default async function LogsPage() {
  const logs = await loadAllLogs();

  return <LogsClient initialLogs={logs} />;
}
