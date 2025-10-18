import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const REGISTRATION_BASE_URL = process.env.REGISTRATION_BASE_URL || 'https://your-project-id-patient.web.app';
const QUEUE_START_NUMBER = parseInt(process.env.QUEUE_START_NUMBER || '1', 10);
const MAX_QUEUE_NUMBER = parseInt(process.env.MAX_QUEUE_NUMBER || '999', 10);

/**
 * Cloud Function to generate a new queue number
 * This is called from the Kiosk app when a patient requests a queue number
 */
export const generateQueueNumber = functions.https.onCall(async (data, context) => {
  const db = admin.firestore();

  try {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Use transaction to ensure atomic increment
    const result = await db.runTransaction(async (transaction) => {
      const counterRef = db.collection('queueCounter').doc(today);
      const counterDoc = await transaction.get(counterRef);

      let currentNumber: number;

      if (!counterDoc.exists) {
        // First queue number of the day
        currentNumber = QUEUE_START_NUMBER;
        transaction.set(counterRef, {
          date: today,
          currentNumber: currentNumber,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } else {
        // Increment existing counter
        const counterData = counterDoc.data();
        currentNumber = (counterData?.currentNumber || 0) + 1;

        // Check if we've exceeded max queue number
        if (currentNumber > MAX_QUEUE_NUMBER) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Queue is full for today. Please try tomorrow.'
          );
        }

        transaction.update(counterRef, {
          currentNumber: currentNumber,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Create registration URL with queue number as parameter
      const registrationUrl = `${REGISTRATION_BASE_URL}?q=${currentNumber}`;

      // Create patient document
      const patientRef = db.collection('patients').doc();
      transaction.set(patientRef, {
        queueNumber: currentNumber,
        status: 'unregistered',
        name: null,
        phone: null,
        age: null,
        gender: null,
        notes: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        registeredAt: null,
        assignedAt: null,
        completedAt: null,
        assignedRoomId: null,
        qrCodeUrl: registrationUrl,
        printedAt: null,
      });

      return {
        queueNumber: currentNumber,
        patientId: patientRef.id,
        registrationUrl: registrationUrl,
      };
    });

    console.log(`Generated queue number ${result.queueNumber} for patient ${result.patientId}`);

    return {
      success: true,
      queueNumber: result.queueNumber,
      patientId: result.patientId,
      registrationUrl: result.registrationUrl,
    };
  } catch (error: any) {
    console.error('Error generating queue number:', error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate queue number',
      error.message
    );
  }
});
