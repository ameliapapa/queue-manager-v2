import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Production Firebase configuration (fallback)
// This ensures the app works even if .env.production is not loaded properly
const productionConfig = {
  apiKey: 'AIzaSyDIXiSS2N6e2mrnrQXWyhzFFjIQh7tWU30',
  authDomain: 'geraldina-queue-manager.firebaseapp.com',
  projectId: 'geraldina-queue-manager',
  storageBucket: 'geraldina-queue-manager.firebasestorage.app',
  messagingSenderId: '800270035531',
  appId: '1:800270035531:web:3530ff27d0ba4653153bce',
};

// Firebase configuration
// Prefer environment variables, fall back to production config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || productionConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || productionConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || productionConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || productionConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || productionConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || productionConfig.appId,
};

// Validate Firebase configuration
console.log('🔥 Firebase Configuration Check:');
console.log('- API Key:', firebaseConfig.apiKey ? '✓ Set' : '✗ Missing');
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);
console.log('- Environment:', import.meta.env.DEV ? 'Development' : 'Production');
console.log('- Use Emulators:', import.meta.env.VITE_USE_EMULATORS);

// Check if using environment variables or fallback
const usingEnvVars = import.meta.env.VITE_FIREBASE_PROJECT_ID === firebaseConfig.projectId;
if (usingEnvVars) {
  console.log('✅ Using environment variables from .env.production');
} else {
  console.log('⚠️  Using hardcoded production config (fallback)');
}

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

// Initialize Firebase
let app;
try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized successfully');
  } else {
    app = getApps()[0];
    console.log('✅ Using existing Firebase app instance');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize services
// Database: "(default)" in europe-west1
console.log('🗄️  Initializing Firestore...');

// Initialize Firestore - IMPORTANT: This must happen synchronously at module load time
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

// Validate immediately after initialization
if (!db || typeof db !== 'object') {
  console.error('❌ CRITICAL: Firestore db failed to initialize!', db);
  throw new Error('Firestore initialization failed - db is invalid');
}

console.log('✅ Firestore initialized successfully');
console.log('- Database type:', db.type);
console.log('- App name:', db.app.name);
console.log('✅ Auth initialized');
console.log('✅ Functions initialized');
console.log('✅ DB validation passed - Firestore is ready');

// Connect to emulators in development
if (isDevelopment && useEmulators) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('Connected to Firebase Emulators');
  } catch (error) {
    console.warn('Error connecting to emulators:', error);
  }
} else {
  console.log('Firebase initialized - connected to production database');
  console.log('Project ID:', firebaseConfig.projectId);
}

// Export with validation
console.log('📦 Exporting Firebase services...');
console.log('- app:', typeof app, app ? '✓' : '✗');
console.log('- db:', typeof db, db ? '✓' : '✗');
console.log('- auth:', typeof auth, auth ? '✓' : '✗');
console.log('- functions:', typeof functions, functions ? '✓' : '✗');

export { app, db, auth, functions };

// Also export as default for debugging
export default {
  app,
  db,
  auth,
  functions,
};
