"use server";

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export async function adjustCreditsAction(userId: string, amount: number, reason: string) {
  try {
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
