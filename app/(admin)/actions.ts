'use server';

import { endAdminSession } from '@/lib/admin-session';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await endAdminSession();
  redirect('/login');
}

