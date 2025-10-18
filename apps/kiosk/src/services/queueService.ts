import QRCode from 'qrcode';
import { collection, doc, getDoc, setDoc, updateDoc, increment, query, where, getDocs, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import { websocketClient } from './websocket';

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
  console.log('🎯 Generating queue number with Firebase Firestore');

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

    console.log('✅ Queue number generated:', queueNumber);

    // Generate patient ID
    const patientId = `patient-${dateString}-${queueNumber}-${Date.now()}`;

    // Generate registration URL
    const registrationUrl = `${window.location.protocol}//${window.location.hostname}:3002/register?queue=${queueNumber}&patient=${patientId}`;

    console.log('📱 Registration URL:', registrationUrl);

    // Generate QR code
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      console.log('✅ QR code generated');
    } catch (error) {
      console.error('❌ Error generating QR code:', error);
      // Fallback to simple data URL
      qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    // Create patient document in Firestore
    const patientRef = doc(db, 'patients', patientId);
    await setDoc(patientRef, {
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
    });

    console.log('💾 Patient saved to Firestore:', {
      patientId,
      queueNumber,
      status: 'pending',
    });

    // Emit WebSocket event for real-time updates
    websocketClient.emitQueueIssued({
      queueNumber,
      issuedAt: new Date(),
      patientId,
    });

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
 * @returns Promise with queue statistics
 */
export async function getQueueStats(): Promise<{
  totalToday: number;
  pending: number;
  registered: number;
}> {
  try {
    console.log('📊 Fetching queue stats from Firestore');

    const dateString = getTodayDateString();

    // Get today's counter
    const counterRef = doc(db, 'queueCounter', dateString);
    const counterDoc = await getDoc(counterRef);
    const totalToday = counterDoc.exists() ? counterDoc.data()?.counter || 0 : 0;

    // Get all patients for today
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef);
    const querySnapshot = await getDocs(q);

    let pending = 0;
    let registered = 0;

    querySnapshot.forEach((doc) => {
      const patient = doc.data();
      const createdAt = patient.createdAt?.toDate();

      // Only count today's patients
      if (createdAt && createdAt.toISOString().split('T')[0] === dateString) {
        if (patient.status === 'pending') {
          pending++;
        } else if (patient.status === 'registered') {
          registered++;
        }
      }
    });

    console.log('📊 Queue stats:', { totalToday, pending, registered });

    return {
      totalToday,
      pending,
      registered,
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
 * Reset queue counter (useful for testing)
 * WARNING: This will delete all queue data for today!
 */
export async function resetQueueCounter() {
  try {
    const dateString = getTodayDateString();

    console.log('🔄 Resetting queue counter for:', dateString);

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

    console.log('✅ Queue counter reset to 0');
    console.log('✅ All patients for today marked as cancelled');
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

// Expose debug functions globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).resetQueue = resetQueueCounter;
  (window as any).debugQueue = debugFirestoreData;
  console.log('🔧 Debug commands available:');
  console.log('  - window.resetQueue() - Reset queue to 0');
  console.log('  - window.debugQueue() - Show Firestore database');
}
