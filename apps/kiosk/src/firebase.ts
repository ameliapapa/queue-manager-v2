import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Production Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDIXiSS2N6e2mrnrQXWyhzFFjIQh7tWU30',
  authDomain: 'geraldina-queue-manager.firebaseapp.com',
  projectId: 'geraldina-queue-manager',
  storageBucket: 'geraldina-queue-manager.firebasestorage.app',
  messagingSenderId: '800270035531',
  appId: '1:800270035531:web:3530ff27d0ba4653153bce',
};

console.log('🔥 Initializing Firebase for Kiosk App...');

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
} else {
  app = getApps()[0];
  console.log('✅ Using existing Firebase app');
}

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export { app };

// Validate
if (!db) {
  throw new Error('Failed to initialize Firestore');
}

console.log('✅ Firebase services ready');
console.log('- Firestore:', typeof db);
console.log('- Auth:', typeof auth);
console.log('- Functions:', typeof functions);
