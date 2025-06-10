// src/lib/firebase/server.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

// Parsear la clave de la cuenta de servicio desde la variable de entorno
// ¡Asegúrate de que FIREBASE_SERVICE_ACCOUNT_KEY esté en una sola línea en .env.local!
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
}

let serviceAccount: any;
try {
  serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
  console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:", e);
  throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format. Must be a valid JSON string.");
}

// Inicializa Firebase Admin SDK (asegura una sola instancia)
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAdminAuth();
const adminDb = getAdminFirestore();

export { adminAuth, adminDb };