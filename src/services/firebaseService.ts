import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { storage } from './storageService';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseAuth: Auth | null = null;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: firebaseAuth?.currentUser?.uid || null,
      email: firebaseAuth?.currentUser?.email || null,
      emailVerified: firebaseAuth?.currentUser?.emailVerified || null,
      isAnonymous: firebaseAuth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function initFirebaseFromConfig(config: {
  apiKey: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}): { success: boolean; error?: string } {
  try {
    if (!config.apiKey || !config.projectId) {
      return { success: false, error: 'ข้อมูล Firebase API Key และ Project ID จำเป็นต้องระบุ' };
    }

    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
    } else {
      firebaseApp = initializeApp(config);
    }

    firestoreDb = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');
    firebaseAuth = getAuth(firebaseApp);

    return { success: true };
  } catch (err: any) {
    console.error('Firebase Init Error:', err);
    return { success: false, error: err?.message || 'ไม่สามารถเชื่อมต่อ Firebase ได้' };
  }
}

export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  const settings = storage.getSettings();
  if (!settings.firebaseProjectId || !settings.firebaseApiKey) {
    return {
      connected: false,
      message: 'ยังไม่มีการกรอกข้อมูล Firebase Configuration (ระบบใช้งาน Local Persistent Storage พร้อม 200 รายชื่อปกติ)'
    };
  }

  try {
    if (!firestoreDb) {
      const res = initFirebaseFromConfig({
        apiKey: settings.firebaseApiKey,
        projectId: settings.firebaseProjectId,
        authDomain: settings.firebaseAuthDomain,
        storageBucket: settings.firebaseStorageBucket,
        messagingSenderId: settings.firebaseMessagingSenderId,
        appId: settings.firebaseAppId
      });
      if (!res.success) {
        return { connected: false, message: res.error || 'การเชื่อมต่อล้มเหลว' };
      }
    }

    if (firestoreDb) {
      await getDocFromServer(doc(firestoreDb, 'system_settings', 'connection_test'));
      return { connected: true, message: 'เชื่อมต่อ Cloud Firestore สำเร็จแล้ว!' };
    }
    return { connected: false, message: 'ฐานข้อมูล Firestore ยังไม่ได้ถูกกำหนดค่า' };
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { connected: false, message: 'Client ออฟไลน์ หรือการเชื่อมต่อเครือข่ายขัดข้อง กรุณาตรวจสอบการตั้งค่า Firebase' };
    }
    return { connected: false, message: `ข้อผิดพลาด: ${error?.message || String(error)}` };
  }
}

export { firebaseApp, firestoreDb, firebaseAuth };
