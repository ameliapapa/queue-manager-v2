import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project-id.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project-id.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize services
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const functions: Functions = getFunctions(app);

// Connect to emulators in development
// NOTE: Emulator connection is disabled for mock mode testing
// To enable emulators, set VITE_USE_EMULATORS=false in .env and start Firebase emulators
// Uncomment the code below when emulators are running:
/*
if (isDevelopment && useEmulators) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.warn('⚠️  Error connecting to emulators:', error);
  }
}
*/

// For now, we're running in MOCK MODE (no emulators needed)
console.log('🔧 Firebase initialized in MOCK MODE - using mock services');
console.log('💡 To use real Firebase, start emulators and update firebase config');

export { app, db, auth, functions };
