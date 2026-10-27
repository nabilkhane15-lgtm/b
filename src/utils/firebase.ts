import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
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

/**
 * Deeply removes all `undefined` properties from any object/array before writing to Firestore
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined || obj === null) return obj;
  return JSON.parse(JSON.stringify(obj));
}

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
  // Always enable cloud sync when Firebase is configured so all browsers stay in sync
  return isFirebaseConfigured();
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
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
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
    try {
      activeDb = initializeFirestore(app, { ignoreUndefinedProperties: true });
    } catch {
      activeDb = getFirestore(app);
    }
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

    const testAppName = `test-${Date.now()}`;
    const testApp = initializeApp(config, testAppName);
    let db: Firestore;
    try {
      db = initializeFirestore(testApp, { ignoreUndefinedProperties: true });
    } catch {
      db = getFirestore(testApp);
    }

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
 * Uploads all club data to Firestore with automatic undefined sanitization and multi-browser member merging
 */
export async function uploadClubDataToFirestore(
  rawData: {
    clubSettings?: any;
    adminProfile?: any;
    adminPin?: string;
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
    deletedMemberIds?: string[];
  },
  options?: {
    overwriteMembers?: boolean;
    deletedMemberId?: string;
    isPasswordUpdate?: boolean;
  }
): Promise<{ success: boolean; count: number; error?: string; mergedData?: any }> {
  const db = getFirestoreDb();
  if (!db) {
    return { success: false, count: 0, error: 'Firebase সংযুক্ত নয়।' };
  }

  try {
    // Strip all undefined fields so Firestore never rejects the payload
    const data = sanitizeForFirestore(rawData);
    const clubId = 'primary_club';
    let totalItems = 0;

    const fullSnapshotRef = doc(db, `clubs/${clubId}/snapshots`, 'latest');
    let existingData: any = null;
    try {
      const existingSnap = await getDoc(fullSnapshotRef);
      if (existingSnap.exists()) {
        existingData = existingSnap.data();
      }
    } catch (e) {
      console.warn('Could not read existing snapshot before merge:', e);
    }

    // Track deleted member IDs so deleted members never get resurrected by another browser
    const deletedSet = new Set<string>(existingData?.deletedMemberIds || data.deletedMemberIds || []);
    if (options?.deletedMemberId) {
      deletedSet.add(options.deletedMemberId);
      try {
        await deleteDoc(doc(db, `clubs/${clubId}/members`, options.deletedMemberId));
      } catch {
        // ignore
      }
    }
    const deletedMemberIds = Array.from(deletedSet);

    // Smart merge members across browsers unless overwriteMembers is explicitly set
    let finalMembers = Array.isArray(data.members) ? [...data.members] : [];
    if (!options?.overwriteMembers && existingData && Array.isArray(existingData.members)) {
      const cloudMembers: any[] = existingData.members.filter(
        (cm: any) => cm && cm.id && !deletedSet.has(cm.id)
      );
      const cloudIds = new Set(cloudMembers.map((cm: any) => cm.id));

      // Keep local members that are either already in cloud OR are newly created real members (id starts with 'm-')
      const validLocalMembers = finalMembers.filter(
        (lm: any) =>
          lm &&
          lm.id &&
          !deletedSet.has(lm.id) &&
          (cloudIds.has(lm.id) || String(lm.id).startsWith('m-'))
      );

      const mergedMap = new Map<string, any>();
      for (const cm of cloudMembers) {
        mergedMap.set(cm.id, cm);
      }
      for (const lm of validLocalMembers) {
        mergedMap.set(lm.id, { ...(mergedMap.get(lm.id) || {}), ...lm });
      }
      finalMembers = Array.from(mergedMap.values());
    } else {
      finalMembers = finalMembers.filter((m: any) => m && m.id && !deletedSet.has(m.id));
    }

    const validMemberIds = new Set(finalMembers.map((m: any) => m.id));

    // Also merge payments, monthlyPayments, and savingsDeposits by ID for valid members
    let finalPayments = Array.isArray(data.payments) ? [...data.payments] : [];
    if (!options?.overwriteMembers && existingData && Array.isArray(existingData.payments)) {
      const payMap = new Map<string, any>();
      for (const cp of existingData.payments) {
        if (cp && cp.id && (!cp.memberId || validMemberIds.has(cp.memberId))) {
          payMap.set(cp.id, cp);
        }
      }
      for (const lp of finalPayments) {
        if (lp && lp.id && (!lp.memberId || validMemberIds.has(lp.memberId))) {
          const prev = payMap.get(lp.id);
          // Prefer PAID/PARTIAL over UNPAID if another browser already recorded payment
          if (prev && prev.status !== 'UNPAID' && lp.status === 'UNPAID') {
            continue;
          }
          payMap.set(lp.id, lp);
        }
      }
      finalPayments = Array.from(payMap.values());
    }

    let finalMonthlyPayments = Array.isArray(data.monthlyPayments) ? [...data.monthlyPayments] : [];
    if (!options?.overwriteMembers && existingData && Array.isArray(existingData.monthlyPayments)) {
      const mPayMap = new Map<string, any>();
      for (const cmp of existingData.monthlyPayments) {
        if (cmp && cmp.id && (!cmp.memberId || validMemberIds.has(cmp.memberId))) {
          mPayMap.set(cmp.id, cmp);
        }
      }
      for (const lmp of finalMonthlyPayments) {
        if (lmp && lmp.id && (!lmp.memberId || validMemberIds.has(lmp.memberId))) {
          const prev = mPayMap.get(lmp.id);
          if (prev && prev.status !== 'UNPAID' && lmp.status === 'UNPAID') {
            continue;
          }
          mPayMap.set(lmp.id, lmp);
        }
      }
      finalMonthlyPayments = Array.from(mPayMap.values());
    }

    let finalSavings = Array.isArray(data.savingsDeposits) ? [...data.savingsDeposits] : [];
    if (!options?.overwriteMembers && existingData && Array.isArray(existingData.savingsDeposits)) {
      const savMap = new Map<string, any>();
      for (const cs of existingData.savingsDeposits) {
        if (cs && cs.id && (!cs.memberId || validMemberIds.has(cs.memberId))) {
          savMap.set(cs.id, cs);
        }
      }
      for (const ls of finalSavings) {
        if (ls && ls.id && (!ls.memberId || validMemberIds.has(ls.memberId))) {
          savMap.set(ls.id, ls);
        }
      }
      finalSavings = Array.from(savMap.values());
    }

    // Preserve custom adminPin from cloud if this browser still has default '1234'
    let effectiveAdminPin = data.adminPin;
    if (!options?.isPasswordUpdate) {
      const cloudPin = existingData?.adminPin || (await fetchAdminPinFromFirestore());
      if (cloudPin && cloudPin !== '1234' && (!effectiveAdminPin || effectiveAdminPin === '1234')) {
        effectiveAdminPin = cloudPin;
      }
    }

    // 1. Save general club metadata and state
    const clubDocRef = doc(db, 'clubs', clubId);
    const clubPayload: any = sanitizeForFirestore({
      settings: data.clubSettings || existingData?.clubSettings || {},
      updatedAt: Timestamp.now(),
    });
    clubPayload.updatedAt = Timestamp.now();
    if (effectiveAdminPin) {
      clubPayload.adminPin = effectiveAdminPin;
    }
    if (data.adminProfile) {
      clubPayload.adminProfile = sanitizeForFirestore(data.adminProfile);
    }
    await setDoc(clubDocRef, clubPayload, { merge: true });
    totalItems++;

    // 1b. If adminPin provided, also sync directly to dedicated security doc
    if (effectiveAdminPin) {
      const secRef = doc(db, `clubs/${clubId}/security`, 'admin');
      await setDoc(secRef, { pin: effectiveAdminPin, updatedAt: Timestamp.now() }, { merge: true });
    }

    // 2. Batch write members
    if (finalMembers.length > 0) {
      const batch = writeBatch(db);
      for (const m of finalMembers) {
        const cleanM = sanitizeForFirestore(m);
        const ref = doc(db, `clubs/${clubId}/members`, cleanM.id);
        batch.set(ref, cleanM, { merge: true });
        totalItems++;
      }
      await batch.commit();
    }

    // 3. Store entire sanitized snapshot for quick restore and live onSnapshot broadcast
    const snapshotPayload = sanitizeForFirestore({
      ...data,
      members: finalMembers,
      payments: finalPayments,
      monthlyPayments: finalMonthlyPayments,
      savingsDeposits: finalSavings,
      adminPin: effectiveAdminPin || '1234',
      deletedMemberIds,
    });

    await setDoc(fullSnapshotRef, {
      ...snapshotPayload,
      uploadedAt: Timestamp.now(),
    });

    return { success: true, count: totalItems, mergedData: snapshotPayload };
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
 * Downloads latest club snapshot from Firestore (and guarantees latest adminPin is included)
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
    const [docSnap, latestPin] = await Promise.all([
      getDoc(doc(db, `clubs/${clubId}/snapshots`, 'latest')),
      fetchAdminPinFromFirestore(),
    ]);

    if (docSnap.exists()) {
      const snapData = docSnap.data();
      if (latestPin) {
        snapData.adminPin = latestPin;
      }
      return { success: true, data: snapData };
    }

    // If snapshot doesn't exist, try club settings
    const clubDocRef = doc(db, 'clubs', clubId);
    const clubSnap = await getDoc(clubDocRef);
    if (clubSnap.exists()) {
      const clubData = clubSnap.data();
      return {
        success: true,
        data: {
          clubSettings: clubData.settings,
          adminPin: latestPin || clubData.adminPin,
          adminProfile: clubData.adminProfile,
        },
      };
    }

    return { success: false, error: 'ক্লাউডে কোনো ডাটা পাওয়া যায়নি।' };
  } catch (err: any) {
    console.error('Failed to download club data from Firestore:', err);
    return { success: false, error: err?.message || 'ডাটা ডাউনলোড করতে ব্যর্থ হয়েছে।' };
  }
}

/**
 * Directly writes updated admin security PIN to Firestore
 */
export async function syncAdminPinToFirestore(pin: string): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;
  try {
    const clubId = 'primary_club';
    await setDoc(
      doc(db, 'clubs', clubId),
      { adminPin: pin, updatedAt: Timestamp.now() },
      { merge: true }
    );
    await setDoc(
      doc(db, `clubs/${clubId}/snapshots`, 'latest'),
      { adminPin: pin, updatedAt: Timestamp.now() },
      { merge: true }
    );
    await setDoc(
      doc(db, `clubs/${clubId}/security`, 'admin'),
      { pin, updatedAt: Timestamp.now() },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Failed to sync admin PIN to Firestore:', err);
    return false;
  }
}

/**
 * Directly fetches the latest admin PIN from Firestore
 */
export async function fetchAdminPinFromFirestore(): Promise<string | null> {
  const db = getFirestoreDb();
  if (!db) return null;
  try {
    const clubId = 'primary_club';
    const secRef = doc(db, `clubs/${clubId}/security`, 'admin');
    const secSnap = await getDoc(secRef);
    if (secSnap.exists() && secSnap.data()?.pin) {
      return String(secSnap.data().pin);
    }

    const snapRef = doc(db, `clubs/${clubId}/snapshots`, 'latest');
    const snapDoc = await getDoc(snapRef);
    if (snapDoc.exists() && snapDoc.data()?.adminPin) {
      return String(snapDoc.data().adminPin);
    }

    const clubRef = doc(db, 'clubs', clubId);
    const clubDoc = await getDoc(clubRef);
    if (clubDoc.exists() && clubDoc.data()?.adminPin) {
      return String(clubDoc.data().adminPin);
    }

    return null;
  } catch (err) {
    console.warn('Failed to fetch admin PIN from Firestore:', err);
    return null;
  }
}

/**
 * Subscribes to real-time changes of the club data from Firestore
 * Whenever any user or admin updates data on any device, all other connected browsers get updated instantly!
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
