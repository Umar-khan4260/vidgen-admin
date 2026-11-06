"use server";

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';

export async function adjustCreditsAction(userId: string, amount: number, reason: string) {
  try {
    await requireAdmin();
    if (!userId) throw new Error('User ID is required');
    if (!amount || isNaN(amount)) throw new Error('A valid credit amount is required');

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User does not exist');

    await userRef.update({
      credits: FieldValue.increment(amount),
      lastActiveAt: FieldValue.serverTimestamp(),
    });

    // Log the transaction
    await userRef.collection('transactions').add({
      amount: amount,
      type: amount > 0 ? 'admin_grant' : 'admin_deduct',
      description: `Admin: ${reason.trim() || 'Manual adjustment'}`,
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath(`/users/${userId}`);
    revalidatePath('/users');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('adjustCreditsAction error:', error);
    return { success: false, error: error.message || 'Failed to adjust credits' };
  }
}

export async function toggleBlockAction(userId: string, isBlocked: boolean, reason?: string) {
  try {
    await requireAdmin();
    if (!userId) throw new Error('User ID is required');

    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      isBlocked: isBlocked,
      blockReason: isBlocked ? (reason?.trim() || 'Suspended by system administrator') : null,
      lastActiveAt: FieldValue.serverTimestamp(),
    });

    revalidatePath(`/users/${userId}`);
    revalidatePath('/users');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('toggleBlockAction error:', error);
    return { success: false, error: error.message || 'Failed to toggle block status' };
  }
}

export interface AssignPlanForm {
  tier: 'weekly' | 'monthly' | 'lifetime';
  credits: number;
}

/** Assign a subscription plan to a user from the admin panel.
 *  Updates user's subscriptionTier, credits, and subscriptionEndDate.
 *  Logs an admin_grant transaction.
 */
export async function assignPlanAction(userId: string, tier: 'weekly' | 'monthly' | 'lifetime', credits: number) {
  try {
    await requireAdmin();
    if (!userId) throw new Error('User ID is required');

    const productMap: Record<string, { tier: string; credits: number; days: number | null }> = {
      weekly:    { tier: 'weekly',    credits: 500,  days: 7    },
      monthly:   { tier: 'monthly',   credits: 2000, days: 30   },
      lifetime:  { tier: 'lifetime',  credits: 7500, days: null },
    };

    const product = productMap[tier];
    if (!product) throw new Error('Invalid plan tier');

    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) throw new Error('User does not exist');

    // Calculate subscription end date for subscription plans (not lifetime)
    let endDate: Date | null = null;
    if (product.days) {
      endDate = new Date(Date.now() + product.days * 24 * 60 * 60 * 1000);
    }

    // Update user document
    await userRef.update({
      subscriptionTier: product.tier,
      credits:          FieldValue.increment(credits), // Add credits on top of existing
      lastActiveAt:     FieldValue.serverTimestamp(),
      ...(endDate && { subscriptionEndDate: endDate }),
    });

    // Log the plan assignment transaction
    await userRef.collection('transactions').add({
      amount:        credits,
      type:          'admin_plan_grant',
      description:   `Admin assigned ${product.tier} plan + ${credits} credits`,
      createdAt:     FieldValue.serverTimestamp(),
    });

    revalidatePath(`/users/${userId}`);
    revalidatePath('/users');
    revalidatePath('/');

    return {
      success: true,
      newTier:    product.tier,
      newCredits: Number(userDoc.data()?.credits || 0) + credits,
      endDate:    endDate ? endDate.toISOString().split('T')[0] : null,
    };
  } catch (error: any) {
    console.error('assignPlanAction error:', error);
    return { success: false, error: error.message || 'Failed to assign plan' };
  }
}

/** Plan configuration interface for admin panel */
export interface PlanConfig {
  tier: 'weekly' | 'monthly' | 'lifetime';
  credits: number;
  days: number | null;
  price: number;
  isActive: boolean;
  displayName: string;
  productId: string;
}

/** Get all plan configurations from Firestore. */
export async function fetchPlanConfigsAction(): Promise<PlanConfig[]> {
  try {
    await requireAdmin();
    const plansRef = adminDb.collection('plans');
    const snapshot = await plansRef.get();
    const plans: PlanConfig[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      plans.push({
        tier: data.tier || 'weekly',
        credits: Number(data.credits) || 0,
        days: data.days,
        price: data.price ?? 0,
        isActive: data.isActive !== false,
        displayName: data.displayName || `${(data.tier || 'weekly')[0].toUpperCase() + (data.tier || 'weekly').slice(1)} Plan`,
        productId: data.productId || getProductIdFromTier(data.tier || 'weekly'),
      });
    });
    // Fallback to default plans if Firestore collection is empty
    if (plans.length === 0) {
      return [
        {
          tier: 'weekly',
          credits: 500,
          days: 7,
          price: 4.99,
          isActive: true,
          displayName: 'Weekly Plan',
          productId: 'com.vidgen.subscription.weekly',
        },
        {
          tier: 'monthly',
          credits: 2000,
          days: 30,
          price: 9.99,
          isActive: true,
          displayName: 'Monthly Plan',
          productId: 'com.vidgen.subscription.monthly',
        },
        {
          tier: 'lifetime',
          credits: 7500,
          days: null,
          price: 49.99,
          isActive: true,
          displayName: 'Lifetime Plan',
          productId: 'com.vidgen.credits.pack.7500',
        },
      ];
    }
    return plans;
  } catch (error: any) {
    console.error('fetchPlanConfigsAction error:', error);
    return [];
  }
}

/** Get product ID from tier name (fallback) */
function getProductIdFromTier(tier: string): string {
  const map: Record<string, string> = {
    weekly: 'com.vidgen.subscription.weekly',
    monthly: 'com.vidgen.subscription.monthly',
    lifetime: 'com.vidgen.credits.pack.7500',
  };
  return map[tier] || 'com.vidgen.subscription.weekly';
}

/** Update a plan configuration in Firestore. */
export async function updatePlanConfigAction(plan: PlanConfig) {
  try {
    await requireAdmin();
    if (!plan.tier) throw new Error('Plan tier is required');

    const productRef = adminDb.collection('plans').doc(plan.tier);
    await productRef.set({
      tier:        plan.tier,
      credits:     plan.credits,
      days:        plan.days,
      price:       plan.price,
      isActive:    plan.isActive,
      displayName:  plan.displayName,
      productId:   plan.productId,
      updatedAt:   FieldValue.serverTimestamp(),
    });

    revalidatePath(`/users/${plan.tier}`);
    revalidatePath('/users');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('updatePlanConfigAction error:', error);
    return { success: false, error: error.message || 'Failed to update plan config' };
  }
}

/** Create a new plan configuration in Firestore. */
export async function createPlanConfigAction(plan: PlanConfig) {
  try {
    await requireAdmin();
    if (!plan.tier) throw new Error('Plan tier is required');

    const productRef = adminDb.collection('plans').doc(plan.tier);
    // Check if plan already exists
    const existing = await productRef.get();
    if (existing.exists) {
      return updatePlanConfigAction(plan);
    }

    await productRef.set({
      tier:        plan.tier,
      credits:     plan.credits,
      days:        plan.days,
      price:       plan.price,
      isActive:    plan.isActive,
      displayName:  plan.displayName,
      productId:   plan.productId,
      createdAt:   FieldValue.serverTimestamp(),
    });

    revalidatePath('/users');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('createPlanConfigAction error:', error);
    return { success: false, error: error.message || 'Failed to create plan config' };
  }
}

/** Delete a plan configuration from Firestore. */
export async function deletePlanConfigAction(tier: PlanConfig['tier']) {
  try {
    await requireAdmin();
    if (!tier) throw new Error('Plan tier is required');

    await adminDb.collection('plans').doc(tier).delete();
    revalidatePath('/plans');
    revalidatePath('/users');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('deletePlanConfigAction error:', error);
    return { success: false, error: error.message || 'Failed to delete plan config' };
  }
}
