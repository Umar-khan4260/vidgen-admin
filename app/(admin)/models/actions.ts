"use server";

import { adminDb, FieldValue } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin-session';

/**
 * Persists the model availability policy (`admin/config.disabledModels`).
 *
 * Only this field is written — system settings are managed on /settings. This
 * keeps the two pages independent so saving one can never wipe the other.
 */
export async function updateModelsAction(data: { disabledModels: string[] }) {
  try {
    await requireAdmin();
    const configRef = adminDb.collection('admin').doc('config');

    const disabledModels = Array.isArray(data.disabledModels)
      ? Array.from(
          new Set(
            data.disabledModels
              .filter((id): id is string => typeof id === 'string')
              .map((id) => id.trim())
              .filter(Boolean)
          )
        )
      : [];

    await configRef.set(
      {
        disabledModels,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    revalidatePath('/models');
    revalidatePath('/settings');
    revalidatePath('/');

    return { success: true as const };
  } catch (error) {
    console.error('updateModelsAction error:', error);
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update model availability',
    };
  }
}
