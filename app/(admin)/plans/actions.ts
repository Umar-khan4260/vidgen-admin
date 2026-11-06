"use server";

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';

export interface PlanData {
  id: string;
  tier: string;
  productId: string;
  displayName: string;
  description: string;
  credits: number;
  price: number;
  currency: string;
  days: number | null;
  type: 'auto_renewable' | 'non_consumable';
  isActive: boolean;
  badge?: string | null;
  features: string[];
  sortOrder: number;
}

const DEFAULT_PLANS: PlanData[] = [
  {
    id: 'weekly',
    tier: 'weekly',
    productId: 'com.vidgen.subscription.weekly',
    displayName: 'Weekly Plan',
    description: '500 credits auto-renewed every 7 days via Apple App Store.',
    credits: 500,
    price: 4.99,
    currency: 'USD',
    days: 7,
    type: 'auto_renewable',
    isActive: true,
    badge: 'Popular',
    features: [
      '500 credits every week',
      'Full access to all video & image models',
      'Rollover unused credits during active subscription',
      'Cancel anytime via App Store'
    ],
    sortOrder: 1,
  },
  {
    id: 'monthly',
    tier: 'monthly',
    productId: 'com.vidgen.subscription.monthly',
    displayName: 'Monthly Plan',
    description: '2,000 credits auto-renewed every 30 days with 25% cost savings.',
    credits: 2000,
    price: 14.99,
    currency: 'USD',
    days: 30,
    type: 'auto_renewable',
    isActive: true,
    badge: 'Best Value',
    features: [
      '2,000 credits every month',
      'Priority generation queue speed',
      'Access to top-tier models (Kling 2.6, Seedance 1.5, Midjourney)',
      'High savings compared to weekly billing'
    ],
    sortOrder: 2,
  },
  {
    id: 'lifetime',
    tier: 'lifetime',
    productId: 'com.vidgen.credits.pack.7500',
    displayName: 'Lifetime Pack',
    description: '7,500 credits one-time top-up pack with no expiration date.',
    credits: 7500,
    price: 49.99,
    currency: 'USD',
    days: null,
    type: 'non_consumable',
    isActive: true,
    badge: 'One-Time',
    features: [
      '7,500 credits instant grant',
      'Credits never expire',
      'Stackable with repeated purchases',
      'No subscription or recurring charges'
    ],
    sortOrder: 3,
  }
];

/** Fetch all plans from Firestore ordered by sortOrder. */
export async function getPlansAction(): Promise<PlanData[]> {
  try {
    await requireAdmin();
    const snapshot = await adminDb.collection('plans').orderBy('sortOrder', 'asc').get();
    if (snapshot.empty) {
      return DEFAULT_PLANS;
    }
    return snapshot.docs
      .filter(doc => doc.id !== 'free' && doc.data().tier !== 'free')
      .map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          tier: d.tier || doc.id,
          productId: d.productId || '',
          displayName: d.displayName || `${doc.id} Plan`,
          description: d.description || '',
          credits: Number(d.credits) || 0,
          price: Number(d.price) || 0,
          currency: d.currency || 'USD',
          days: d.days !== undefined && d.days !== null ? Number(d.days) : null,
          type: d.type || (d.tier === 'lifetime' ? 'non_consumable' : 'auto_renewable'),
          isActive: d.isActive !== false,
          badge: d.badge || null,
          features: Array.isArray(d.features) ? d.features : [],
          sortOrder: Number(d.sortOrder) || 0,
        };
      });
  } catch (error: any) {
    console.error('getPlansAction error:', error);
    return DEFAULT_PLANS;
  }
}

/** Toggle whether a plan is active in the system. */
export async function togglePlanStatusAction(planId: string, isActive: boolean) {
  try {
    await requireAdmin();
    if (!planId) throw new Error('Plan ID is required');

    const planRef = adminDb.collection('plans').doc(planId);
    await planRef.update({
      isActive,
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath('/plans');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('togglePlanStatusAction error:', error);
    return { success: false, error: error.message || 'Failed to toggle plan status' };
  }
}

/** Update plan fields in Firestore. */
export async function updatePlanAction(planId: string, payload: Partial<PlanData>) {
  try {
    await requireAdmin();
    if (!planId) throw new Error('Plan ID is required');

    const planRef = adminDb.collection('plans').doc(planId);
    const existing = await planRef.get();
    if (!existing.exists) throw new Error('Plan not found in database');

    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (payload.displayName !== undefined) updateData.displayName = payload.displayName.trim();
    if (payload.description !== undefined) updateData.description = payload.description.trim();
    if (payload.credits !== undefined) updateData.credits = Math.max(0, Number(payload.credits) || 0);
    if (payload.price !== undefined) updateData.price = Math.max(0, Number(payload.price) || 0);
    if (payload.currency !== undefined) updateData.currency = payload.currency.trim().toUpperCase() || 'USD';
    if (payload.productId !== undefined) updateData.productId = payload.productId.trim();
    if (payload.days !== undefined) updateData.days = payload.days !== null ? Number(payload.days) : null;
    if (payload.isActive !== undefined) updateData.isActive = Boolean(payload.isActive);
    if (payload.badge !== undefined) updateData.badge = payload.badge ? payload.badge.trim() : null;
    if (payload.features !== undefined) updateData.features = payload.features.filter(f => f && f.trim());
    if (payload.type !== undefined) updateData.type = payload.type;

    await planRef.update(updateData);

    revalidatePath('/plans');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('updatePlanAction error:', error);
    return { success: false, error: error.message || 'Failed to update plan' };
  }
}

/** Re-seed or initialize the 3 purchasable plans in Firestore. */
export async function seedDefaultPlansAction() {
  try {
    await requireAdmin();
    const batch = adminDb.batch();

    // Ensure legacy free plan doc is removed if present
    batch.delete(adminDb.collection('plans').doc('free'));

    for (const plan of DEFAULT_PLANS) {
      const ref = adminDb.collection('plans').doc(plan.id);
      batch.set(ref, {
        ...plan,
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    await batch.commit();

    revalidatePath('/plans');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('seedDefaultPlansAction error:', error);
    return { success: false, error: error.message || 'Failed to seed plans' };
  }
}
