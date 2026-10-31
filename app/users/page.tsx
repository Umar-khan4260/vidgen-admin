import { adminDb } from '@/lib/firebase-admin';
import UserListClient, { UserSummary } from './UserListClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const snapshot = await adminDb.collection('users')
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get();

  const users: UserSummary[] = snapshot.docs.map(doc => {
    const data = doc.data();
    const lastActive = data.lastActiveAt?.toDate();
    const created = data.createdAt?.toDate();

    return {
      id: doc.id,
      sharedUserId: data.sharedUserId || doc.id,
      credits: Number(data.credits) || 0,
      subscriptionTier: data.subscriptionTier || 'free',
      totalGenerations: Number(data.totalGenerations) || 0,
      platform: data.platform || 'macos',
      isBlocked: Boolean(data.isBlocked),
      blockReason: data.blockReason || null,
      lastActiveFormatted: lastActive ? lastActive.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never',
      createdAtFormatted: created ? created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          User Management
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Search, view credits, grant bonuses, and manage account statuses.
        </p>
      </div>

      <UserListClient initialUsers={users} />
    </div>
  );
}
