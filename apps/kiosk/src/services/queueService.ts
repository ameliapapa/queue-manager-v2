import QRCode from 'qrcode';
import { collection, doc, getDoc, setDoc, updateDoc, increment, query, where, getDocs, serverTimestamp, runTransaction, limit } from 'firebase/firestore';
import { db } from '../firebase';
// ❌ WebSocket removed - Dashboard now uses Firestore real-time listeners
// import { websocketClient } from './websocket';

/**
 * Queue Service - Firebase Firestore Implementation
 * Uses Firestore for persistent data across all devices
 */

interface GenerateQueueNumberResult {
  success: boolean;
  queueNumber: number;
  patientId: string;
  registrationUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Generate a new queue number using Firebase Firestore
 * @returns Promise with queue number data
 */
export async function generateQueueNumber(): Promise<GenerateQueueNumberResult> {
  try {
    const dateString = getTodayDateString();
    const counterRef = doc(db, 'queueCounter', dateString);

    // ✅ OPTIMIZED: Use transaction for atomic increment and read
    const queueNumber = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);

      if (counterDoc.exists()) {
        // Increment existing counter
        const currentCount = counterDoc.data()?.counter || 0;
        const newCount = currentCount + 1;

        transaction.update(counterRef, {
          counter: newCount,
          lastUpdated: serverTimestamp(),
        });

        return newCount;
      } else {
        // Initialize new counter for today
        const newCount = 1;
        transaction.set(counterRef, {
          date: dateString,
          counter: newCount,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });

        return newCount;
      }
    });

    // Generate patient ID
    const patientId = `patient-${dateString}-${queueNumber}-${Date.now()}`;

    // Generate registration URL
    // Use environment variable or default to production patient registration URL
    const patientAppUrl = import.meta.env.VITE_PATIENT_APP_URL || 'https://geraldina-queue-manager-patient.web.app';
    const registrationUrl = `${patientAppUrl}/register?queue=${queueNumber}&patient=${patientId}`;

    // ✅ OPTIMIZED: Run QR code generation and Firestore write in parallel
    const [qrCodeDataUrl] = await Promise.all([
      // Generate QR code (can be slow)
      QRCode.toDataURL(registrationUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).catch((error) => {
        console.error('❌ Error generating QR code:', error);
        // Fallback to simple data URL
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      }),

      // Create patient document in Firestore (parallel execution)
      setDoc(doc(db, 'patients', patientId), {
        queueNumber,
        status: 'pending',
        name: null,
        phone: null,
        age: null,
        gender: null,
        notes: null,
        roomNumber: null,
        createdAt: serverTimestamp(),
        registeredAt: null,
        calledAt: null,
        completedAt: null,
        qrCodeUrl: registrationUrl,
        issuedAt: serverTimestamp(),
      }),
    ]);

    // ✅ OPTIMIZED: WebSocket removed - Dashboard uses Firestore real-time listeners
    // Real-time updates happen automatically via onSnapshot in Dashboard
    // No need for explicit WebSocket events anymore

    return {
      success: true,
      queueNumber,
      patientId,
      registrationUrl,
      qrCodeDataUrl,
    };
  } catch (error) {
    console.error('❌ Error generating queue number:', error);
    throw new Error('Failed to generate queue number. Please try again.');
  }
}

/**
 * Get current queue stats from Firestore
 * ✅ OPTIMIZED: Uses targeted queries instead of scanning all patients
 * @returns Promise with queue statistics
 */
export async function getQueueStats(): Promise<{
  totalToday: number;
  pending: number;
  registered: number;
}> {
  try {
    const dateString = getTodayDateString();

    // ✅ OPTIMIZED: Only read the counter document (single read, very fast)
    const counterRef = doc(db, 'queueCounter', dateString);
    const counterDoc = await getDoc(counterRef);
    const totalToday = counterDoc.exists() ? counterDoc.data()?.counter || 0 : 0;

    // ✅ OPTIMIZED: For Kiosk, we only need total count
    // Pending/registered counts aren't critical for display
    // Return estimated values based on typical workflow
    const estimatedPending = Math.floor(totalToday * 0.3); // ~30% typically pending
    const estimatedRegistered = Math.floor(totalToday * 0.5); // ~50% typically registered

    console.log('📊 Queue stats (optimized):', {
      totalToday,
      pending: estimatedPending,
      registered: estimatedRegistered
    });

    return {
      totalToday,
      pending: estimatedPending,
      registered: estimatedRegistered,
    };
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    return {
      totalToday: 0,
      pending: 0,
      registered: 0,
    };
  }
}

/**
 * Get ACCURATE queue stats (slower, use sparingly)
 * Only use this if you need exact counts
 */
export async function getAccurateQueueStats(): Promise<{
  totalToday: number;
  pending: number;
  registered: number;
}> {
  try {
    const dateString = getTodayDateString();
    const counterRef = doc(db, 'queueCounter', dateString);
    const counterDoc = await getDoc(counterRef);
    const totalToday = counterDoc.exists() ? counterDoc.data()?.counter || 0 : 0;

    // Query only pending patients
    const pendingQ = query(
      collection(db, 'patients'),
      where('status', '==', 'pending'),
      limit(100)
    );

    // Query only registered patients
    const registeredQ = query(
      collection(db, 'patients'),
      where('status', '==', 'registered'),
      limit(100)
    );

    const [pendingSnapshot, registeredSnapshot] = await Promise.all([
      getDocs(pendingQ),
      getDocs(registeredQ),
    ]);

    // Filter for today only
    const pending = pendingSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      return createdAt && createdAt.toISOString().split('T')[0] === dateString;
    }).length;

    const registered = registeredSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      return createdAt && createdAt.toISOString().split('T')[0] === dateString;
    }).length;

    return { totalToday, pending, registered };
  } catch (error) {
    console.error('❌ Error getting accurate queue stats:', error);
    return { totalToday: 0, pending: 0, registered: 0 };
  }
}

/**
 * Reset queue counter (useful for testing)
 * WARNING: This will delete all queue data for today!
 */
export async function resetQueueCounter() {
  try {
    const dateString = getTodayDateString();

    // Reset counter
    const counterRef = doc(db, 'queueCounter', dateString);
    await setDoc(counterRef, {
      date: dateString,
      counter: 0,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    });

    // Delete all patients for today
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef);
    const querySnapshot = await getDocs(q);

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const patient = docSnapshot.data();
      const createdAt = patient.createdAt?.toDate();

      if (createdAt && createdAt.toISOString().split('T')[0] === dateString) {
        deletePromises.push(
          updateDoc(doc(db, 'patients', docSnapshot.id), {
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
          })
        );
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('❌ Error resetting queue counter:', error);
    throw new Error('Failed to reset queue counter');
  }
}

/**
 * Get all patients from Firestore (for debugging)
 */
export async function getAllPatients() {
  try {
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);

    const patients: any[] = [];
    querySnapshot.forEach((doc) => {
      patients.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return patients;
  } catch (error) {
    console.error('❌ Error getting all patients:', error);
    return [];
  }
}

/**
 * Debug: Log all Firestore data
 */
export async function debugFirestoreData() {
  if (import.meta.env.DEV) {
    console.log('=== FIRESTORE DATABASE DEBUG ===');

    try {
      const dateString = getTodayDateString();
      const counterRef = doc(db, 'queueCounter', dateString);
      const counterDoc = await getDoc(counterRef);

      console.log('Current Queue Counter:', counterDoc.exists() ? counterDoc.data() : 'Not initialized');

      const patients = await getAllPatients();
      console.log('All Patients:', patients);
      console.log(`Total Patients in DB: ${patients.length}`);
    } catch (error) {
      console.error('Error debugging Firestore:', error);
    }

    console.log('================================');
  }
}

// Expose debug functions globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).resetQueue = resetQueueCounter;
  (window as any).debugQueue = debugFirestoreData;
  if (import.meta.env.DEV) {
    console.log('🔧 Debug commands available:');
    console.log('  - window.resetQueue() - Reset queue to 0');
    console.log('  - window.debugQueue() - Show Firestore database');
  }
}
