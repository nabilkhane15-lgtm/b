import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
  onSnapshot,
  Firestore,
  Timestamp,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const FIREBASE_CONFIG_KEY = 'badminton_firebase_config';
const FIREBASE_SYNC_ENABLED_KEY = 'badminton_firebase_sync_enabled';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: 'AIzaSyBCsLEuK_C0S86MAh2NusVjISaxjCoqvMo',
  authDomain: 'badminton-7ae79.firebaseapp.com',
  projectId: 'badminton-7ae79',
  storageBucket: 'badminton-7ae79.firebasestorage.app',
  messagingSenderId: '61275964995',
  appId: '1:61275964995:web:e37b01aa91ad0477c4b6f6',
  measurementId: 'G-2Q2GQ06KKF'
};

export const DEFAULT_FIREBASE_PROJECT_ID = 'badminton-7ae79';

// Attempt to load default from env or preset if available
function getInitialConfig(): FirebaseConfig | null {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved firebase config', e);
  }

  // Check Vite environment variables as fallback
  const metaEnv = (import.meta as any).env || {};
  const envApiKey = metaEnv.VITE_FIREBASE_API_KEY;
  const envProjectId = metaEnv.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_PROJECT_ID;
  const envAppId = metaEnv.VITE_FIREBASE_APP_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: envAppId || `1:web:${envProjectId}`,
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Fallback to the configured default
  return DEFAULT_FIREBASE_CONFIG;
}

let activeApp: FirebaseApp | null = null;
let activeDb: Firestore | null = null;

export function getFirebaseConfig(): FirebaseConfig | null {
  return getInitialConfig();
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config && config.apiKey && config.projectId);
}

export function isFirebaseSyncEnabled(): boolean {
  const stored = localStorage.getItem(FIREBASE_SYNC_ENABLED_KEY);
  if (stored === null) {
    // If not set explicitly, default to enabled if configured
    return isFirebaseConfigured();
  }
  return stored === 'true';
}

export function setFirebaseSyncEnabled(enabled: boolean) {
  localStorage.setItem(FIREBASE_SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Gets the publicly accessible URL that anyone on any device can open without logging into AI Studio
 */
export function getPublicShareUrl(): string {
  try {
    const origin = window.location.origin;
    // If running in AI Studio dev environment (ais-dev-...), convert to pre-shared public URL (ais-pre-...)
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    // Fallback if inside an iframe or local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'https://ais-pre-anosqim3lp7ie6rj7snjfg-925458645186.asia-southeast1.run.app';
    }
    return origin;
  } catch {
    return 'https://ais-pre-anosqim3lp7ie6rj7snjfg-925458645186.asia-southeast1.run.app';
  }
}

export function saveFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    // Reset instances to reinitialize
    activeApp = null;
    activeDb = null;
    getFirestoreDb();
    return true;
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
    return false;
  }
}

export function clearFirebaseConfig() {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
  localStorage.removeItem(FIREBASE_SYNC_ENABLED_KEY);
  activeApp = null;
  activeDb = null;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (activeApp) return activeApp;

  const config = getFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const apps = getApps();
    if (apps.length > 0) {
      activeApp = getApp();
    } else {
      activeApp = initializeApp(config);
    }
    return activeApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

export function getFirestoreDb(): Firestore | null {
  if (activeDb) return activeDb;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    activeDb = getFirestore(app);
    return activeDb;
  } catch (error) {
    console.error('Error getting Firestore instance:', error);
    return null;
  }
}

/**
 * Tests connection to Firestore with provided or stored config
 */
export async function testFirebaseConnection(customConfig?: FirebaseConfig): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const config = customConfig || getFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return {
        success: false,
        message: 'Firebase API Key এবং Project ID পূরণ করা হয়নি।',
      };
    }

    // Initialize temporary test app if custom config
    let testApp: FirebaseApp;
    const testAppName = `test-${Date.now()}`;
    testApp = initializeApp(config, testAppName);
    const db = getFirestore(testApp);

    // Try writing and reading a lightweight healthcheck doc
    const pingDocRef = doc(db, '_connection_test', 'ping');
    await setDoc(pingDocRef, {
      lastPing: Timestamp.now(),
      status: 'ok',
      client: 'Badminton Club Manager',
    });

    const snapshot = await getDoc(pingDocRef);
    if (snapshot.exists()) {
      return {
        success: true,
        message: `সফলভাবে Firebase Firestore-এ কানেক্ট করা হয়েছে! (Project: ${config.projectId})`,
      };
    } else {
      return {
        success: false,
        message: 'ডকুমেন্ট তৈরি হয়েছে কিন্তু পড়া সম্ভব হয়নি। Firestore Rules চেক করুন।',
      };
    }
  } catch (err: any) {
    console.error('Firebase test failed:', err);
    let msg = err?.message || 'Firebase সার্ভারে কানেক্ট করতে ব্যর্থ হয়েছে।';
    const lower = (msg + ' ' + (err?.code || '')).toLowerCase();
    
    if (lower.includes('not-found') || lower.includes('does not exist') || lower.includes('database (default) does not exist') || lower.includes('no document to update')) {
      msg = '⚠️ Firestore Database এখনও তৈরি করা হয়নি! অনুগ্রহ করে Firebase Console-এ গিয়ে বাম পাশের মেনু থেকে "Firestore Database" এ ক্লিক করুন এবং "Create database" বাটনে চাপুন (Start in test mode নির্বাচন করুন)।';
    } else if (lower.includes('permission-denied') || lower.includes('missing or insufficient permissions')) {
      msg = '🔒 অনুমতি মেলেনি (Permission Denied)! অনুগ্রহ করে Firebase Console > Firestore Database > Rules ট্যাবে গিয়ে allow read, write: if true; লিখে Publish বাটনে চাপুন।';
    } else if (lower.includes('api-key-not-valid') || lower.includes('invalid-api-key') || lower.includes('api key not valid')) {
      msg = '🔑 অকার্যকর API Key! অনুগ্রহ করে Firebase Console > Project Settings > General থেকে সঠিক Web API Key কপি করে পেস্ট করুন।';
    } else if (lower.includes('quota') || lower.includes('resource-exhausted')) {
      msg = 'Firebase প্রজেক্টের কোটা শেষ হয়েছে বা Billing লিমিট অতিক্রম করেছে।';
    }
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Uploads all club data to Firestore
 */
export async function uploadClubDataToFirestore(data: {
  clubSettings?: any;
  seasons?: any[];
  members?: any[];
  weeks?: any[];
  months?: any[];
  payments?: any[];
  monthlyPayments?: any[];
  savingsDeposits?: any[];
  expenses?: any[];
  tournaments?: any[];
  picnics?: any[];
  customFunds?: any[];
  fundContributions?: any[];
  fundExpenses?: any[];
  leaderboardAwards?: any[];
}): Promise<{ success: boolean; count: number; error?: string }> {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, count: 0, error: 'Firebase সংযুক্ত নয়।' };
  }

  try {
    const clubId = data.clubSettings?.clubName ? 'primary_club' : 'default_club';
    let totalItems = 0;

    // 1. Save general club metadata and state
    const clubDocRef = doc(db, 'clubs', clubId);
    await setDoc(
      clubDocRef,
      {
        settings: data.clubSettings || {},
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    totalItems++;

    // 2. Batch write members
    if (data.members && data.members.length > 0) {
      const batch = writeBatch(db);
      for (const m of data.members) {
        const ref = doc(db, `clubs/${clubId}/members`, m.id);
        batch.set(ref, m, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 3. Batch write seasons
    if (data.seasons && data.seasons.length > 0) {
      const batch = writeBatch(db);
      for (const s of data.seasons) {
        const ref = doc(db, `clubs/${clubId}/seasons`, s.id);
        batch.set(ref, s, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 4. Batch write weeks
    if (data.weeks && data.weeks.length > 0) {
      const batch = writeBatch(db);
      for (const w of data.weeks) {
        const ref = doc(db, `clubs/${clubId}/weeks`, w.id);
        batch.set(ref, w, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 5. Batch write payments
    if (data.payments && data.payments.length > 0) {
      const batch = writeBatch(db);
      for (const p of data.payments) {
        const ref = doc(db, `clubs/${clubId}/payments`, p.id);
        batch.set(ref, p, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 6. Batch write expenses
    if (data.expenses && data.expenses.length > 0) {
      const batch = writeBatch(db);
      for (const exp of data.expenses) {
        const ref = doc(db, `clubs/${clubId}/expenses`, exp.id);
        batch.set(ref, exp, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 7. Store entire snapshot for quick restore
    const fullSnapshotRef = doc(db, `clubs/${clubId}/snapshots`, 'latest');
    await setDoc(fullSnapshotRef, {
      ...data,
      uploadedAt: Timestamp.now(),
    });

    return { success: true, count: totalItems };
  } catch (err: any) {
    console.error('Failed to upload club data to Firestore:', err);
    return {
      success: false,
      count: 0,
      error: err?.message || 'ডাটা আপলোড করতে ব্যর্থ হয়েছে।',
    };
  }
}

/**
 * Downloads latest club snapshot from Firestore
 */
export async function downloadClubDataFromFirestore(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, error: 'Firebase সংযুক্ত নয়।' };
  }

  try {
    const clubId = 'primary_club';
    const snapshotRef = doc(db, `clubs/${clubId}/snapshots`, 'latest');
    const docSnap = await getDoc(snapshotRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }

    // If snapshot doesn't exist, try club settings
    const clubDocRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubDocRef);
    if (clubSnap.exists()) {
      const clubData = clubSnap.data();
      return { success: true, data: { clubSettings: clubData.settings } };
    }

    return { success: false, error: 'ক্লাউডে কোনো ডাটা পাওয়া যায়নি।' };
  } catch (err: any) {
    console.error('Failed to download club data from Firestore:', err);
    return { success: false, error: err?.message || 'ডাটা ডাউনলোড করতে ব্যর্থ হয়েছে।' };
  }
}

/**
 * Subscribes to real-time changes of the club data from Firestore
 * Whenever any admin updates data on any device, all other connected devices get updated instantly!
 */
export function subscribeToClubDataSnapshot(
  onData: (data: any) => void,
  onError?: (err: any) => void
): (() => void) | null {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const clubId = 'primary_club';
    const snapshotRef = doc(db, `clubs/${clubId}/snapshots`, 'latest');
    const unsubscribe = onSnapshot(
      snapshotRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData) {
            onData(cloudData);
          }
        }
      },
      (err) => {
        console.warn('Real-time Firestore listener status:', err);
        if (onError) onError(err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to Firestore snapshot:', err);
    return null;
  }
}
