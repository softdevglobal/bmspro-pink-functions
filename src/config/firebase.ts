import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK (auto-picks up credentials in Cloud Functions environment)
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
