import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, FieldValue, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let app: App;

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'vidgen-ai-backend';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawPrivateKey) {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    app = initializeApp({
      projectId,
    });
  }
} else {
  app = getApps()[0];
}

export const adminDb: Firestore = getFirestore(app);
export const adminAuth: Auth = getAuth(app);
export { FieldValue };
