import { httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, functions } from '../firebase/config';
import { mockGenerateQueueNumber } from './mockService';

/**
 * Service for queue number generation via Cloud Functions
 */

// Check if we should use mock mode (when emulators aren't running)
const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true' || !import.meta.env.VITE_USE_EMULATORS;

interface GenerateQueueNumberResult {
  success: boolean;
  queueNumber: number;
  patientId: string;
  registrationUrl: string;
}

/**
 * Generate a new queue number by calling the Cloud Function
 * @returns Promise with queue number data
 */
export async function generateQueueNumber(): Promise<GenerateQueueNumberResult> {
  // Use mock mode if emulators aren't available
  if (USE_MOCK_MODE) {
    console.log('🔧 Using MOCK mode for queue generation (emulators not connected)');
    return await mockGenerateQueueNumber();
  }

  try {
    const generateNumber = httpsCallable<void, GenerateQueueNumberResult>(
      functions,
      'generateQueueNumber'
    );

    const result = await generateNumber();

    if (!result.data.success) {
      throw new Error('Failed to generate queue number');
    }

    return result.data;
  } catch (error: any) {
    console.error('Error generating queue number:', error);

    // Handle specific error cases
    if (error.code === 'resource-exhausted') {
      throw new Error('Queue is full for today. Please try again tomorrow.');
    }

    if (error.code === 'unavailable') {
      throw new Error('Service temporarily unavailable. Please try again.');
    }

    throw new Error(
      error.message || 'Failed to generate queue number. Please contact staff.'
    );
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
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Query patients created today
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      where('createdAt', '>=', Timestamp.fromDate(today))
    );

    const snapshot = await getDocs(q);

    let totalToday = 0;
    let pending = 0;
    let registered = 0;

    snapshot.forEach((doc) => {
      totalToday++;
      const data = doc.data();
      if (data.status === 'unregistered') {
        pending++;
      } else if (data.status === 'registered') {
        registered++;
      }
    });

    return {
      totalToday,
      pending,
      registered,
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      totalToday: 0,
      pending: 0,
      registered: 0,
    };
  }
}
