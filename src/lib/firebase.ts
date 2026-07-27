import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

import firebaseConfigData from '../../firebase-applet-config.json';

const config: Record<string, string> = (firebaseConfigData as Record<string, string>) || {};

const firebaseConfig = {
  apiKey: config.apiKey || '',
  authDomain: config.authDomain || '',
  projectId: config.projectId || '',
  storageBucket: config.storageBucket || '',
  messagingSenderId: config.messagingSenderId || '',
  appId: config.appId || '',
};

let appInstance;
let dbInstance: any = null;
let authInstance: any = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = config.firestoreDatabaseId
      ? getFirestore(appInstance, config.firestoreDatabaseId)
      : getFirestore(appInstance);
    authInstance = getAuth(appInstance);

    signInAnonymously(authInstance).catch((err) => {
      console.warn('Anonymous auth error:', err);
    });
  }
} catch (err) {
  console.warn('Firebase init error, using local fallback data:', err);
}

export const db = dbInstance;
export const auth = authInstance;
