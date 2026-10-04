import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

let dbInstance: Firestore | null = null;
let databaseId: string | undefined = undefined;
let projectId: string = '';

export function getDb(): Firestore {
  if (dbInstance) {
    return dbInstance;
  }

  // Load config from firebase-applet-config.json
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  let config: Record<string, any> = {};

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (err) {
      console.error('Failed to parse firebase-applet-config.json:', err);
    }
  }

  projectId = config.projectId || process.env.FIREBASE_PROJECT_ID || 'xanthic-campus-7ghtt';
  databaseId = config.firestoreDatabaseId || '(default)';

  const firebaseConfig = {
    apiKey: config.apiKey || process.env.FIREBASE_API_KEY,
    authDomain: config.authDomain || `${projectId}.firebaseapp.com`,
    projectId: projectId,
    storageBucket: config.storageBucket || `${projectId}.firebasestorage.app`,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  };

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // Connect to custom database if provided or default
  if (databaseId && databaseId !== '(default)') {
    dbInstance = getFirestore(app, databaseId);
  } else {
    dbInstance = getFirestore(app);
  }

  return dbInstance;
}

export function getFirestoreInfo() {
  return {
    projectId,
    databaseId,
  };
}

export {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  orderBy,
};
