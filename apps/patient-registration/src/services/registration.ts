/**
 * Registration Service
 * Handles patient registration form submission and Firestore updates
 */

import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import { websocketClient } from './websocket';

export interface RegistrationData {
  queueNumber: number;
  patientId?: string;
  name: string;
  phone: string;
  age: string;
  gender: string;
  notes?: string;
}

/**
 * Submit patient registration
 * Creates or updates patient document in Firestore
 */
export async function submitRegistration(data: RegistrationData): Promise<void> {
  console.log('📝 Submitting patient registration');
  console.log('  Queue Number:', data.queueNumber);
  console.log('  Patient ID:', data.patientId);

  try {
    const patientData = {
      queueNumber: data.queueNumber,
      name: data.name,
      phone: data.phone,
      age: parseInt(data.age, 10),
      gender: data.gender,
      notes: data.notes || '',
      status: 'registered',
      registeredAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (data.patientId) {
      // Patient ID provided (from kiosk QR code)
      const patientRef = doc(db, 'patients', data.patientId);

      // Check if document exists
      const docSnap = await getDoc(patientRef);

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(patientRef, {
          ...patientData,
          updatedAt: serverTimestamp(),
        });
        console.log('✅ Updated existing patient document');
      } else {
        // Create new document with provided ID
        await setDoc(patientRef, {
          ...patientData,
          createdAt: serverTimestamp(),
        });
        console.log('✅ Created new patient document');
      }
    } else {
      // No patient ID - create new document with queue number as ID
      const patientRef = doc(db, 'patients', `queue-${data.queueNumber}`);

      await setDoc(patientRef, {
        ...patientData,
        createdAt: serverTimestamp(),
      });
      console.log('✅ Created patient document with queue-based ID');
    }

    console.log('✅ Registration submitted successfully');

    // Emit WebSocket event for real-time updates
    websocketClient.emitPatientRegistered({
      queueNumber: data.queueNumber,
      patientId: data.patientId || `queue-${data.queueNumber}`,
      name: data.name,
      phone: data.phone,
      age: parseInt(data.age, 10),
      gender: data.gender,
      notes: data.notes,
      registeredAt: new Date(),
    });
  } catch (error) {
    console.error('❌ Registration submission failed:', error);
    throw new Error('Failed to submit registration. Please try again.');
  }
}

/**
 * Get patient by queue number
 */
export async function getPatientByQueue(queueNumber: number): Promise<any> {
  try {
    const patientRef = doc(db, 'patients', `queue-${queueNumber}`);
    const docSnap = await getDoc(patientRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    return null;
  } catch (error) {
    console.error('Error fetching patient:', error);
    throw error;
  }
}
