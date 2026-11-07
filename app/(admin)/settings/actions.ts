"use server";

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';

export async function updateSystemConfigAction(data: {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  defaultCredits: number;
  imageCreditFloor?: number;
  videoCreditFloor?: number;
}) {
  try {
    await requireAdmin();
    const configRef = adminDb.collection('admin').doc('config');

    const updatePayload: Record<string, unknown> = {
      maintenanceMode: Boolean(data.maintenanceMode),
      maintenanceMessage: data.maintenanceMessage?.trim() || 'The app is currently undergoing scheduled maintenance. Please check back shortly.',
      defaultCredits: Math.max(0, Number(data.defaultCredits) || 0),
      freeCredits: Math.max(0, Number(data.defaultCredits) || 0), // mirror for backwards compatibility
      imageCreditFloor: Math.max(0, Number(data.imageCreditFloor) || 40),
      videoCreditFloor: Math.max(0, Number(data.videoCreditFloor) || 80),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await configRef.set(updatePayload, { merge: true });

    revalidatePath('/settings');
    revalidatePath('/');
    revalidatePath('/users');

    return { success: true };
  } catch (error) {
    console.error('updateSystemConfigAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update system settings',
    };
  }
}
