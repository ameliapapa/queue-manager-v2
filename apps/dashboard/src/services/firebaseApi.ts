/**
 * Firebase API Service
 * Implements all Dashboard operations using Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import {
  Room,
  Patient,
  UnregisteredQueue,
  Assignment,
  PatientFormData,
  ApiResponse,
  PatientStatus,
  RoomStatus,
} from '../types';

/**
 * Helper: Convert Firestore Timestamp to Date
 */
function convertTimestamps<T>(data: any): T {
  if (!data) return data;

  const converted: any = { ...data };

  for (const key in converted) {
    if (converted[key] instanceof Timestamp) {
      converted[key] = converted[key].toDate();
    }
  }

  return converted as T;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Get all rooms
 */
export async function getRooms(): Promise<ApiResponse<Room[]>> {
  try {
    console.log('📊 Fetching rooms from Firestore');

    const roomsRef = collection(db, 'rooms');
    const querySnapshot = await getDocs(roomsRef);

    const rooms: Room[] = [];
    querySnapshot.forEach((doc) => {
      const roomData = convertTimestamps<Room>({ id: doc.id, ...doc.data() });
      rooms.push(roomData);
    });

    console.log(`✅ Fetched ${rooms.length} rooms`);
    return { success: true, data: rooms };
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    return { success: false, error: 'Failed to fetch rooms' };
  }
}

/**
 * Get all patients (including completed)
 */
export async function getAllPatients(): Promise<ApiResponse<Patient[]>> {
  try {
    console.log('📊 Fetching all patients from Firestore');

    const dateString = getTodayDateString();
    const patientsRef = collection(db, 'patients');
    const querySnapshot = await getDocs(patientsRef);

    const patients: Patient[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const patientData = docSnapshot.data();
      const createdAt = patientData.createdAt?.toDate();

      // Only include today's patients
      if (createdAt && createdAt.toISOString().split('T')[0] === dateString) {
        const patient = convertTimestamps<Patient>({
          id: docSnapshot.id,
          ...patientData
        });
        patients.push(patient);
      }
    });

    console.log(`✅ Fetched ${patients.length} patients`);
    return { success: true, data: patients };
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    return { success: false, error: 'Failed to fetch patients' };
  }
}

/**
 * Get all registered patients
 */
export async function getRegisteredPatients(): Promise<ApiResponse<Patient[]>> {
  try {
    console.log('📊 Fetching registered patients from Firestore');

    const dateString = getTodayDateString();
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('status', '==', 'registered'));
    const querySnapshot = await getDocs(q);

    const patients: Patient[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const patientData = docSnapshot.data();
      const createdAt = patientData.createdAt?.toDate();

      // Only include today's patients
      if (createdAt && createdAt.toISOString().split('T')[0] === dateString) {
        const patient = convertTimestamps<Patient>({
          id: docSnapshot.id,
          ...patientData
        });
        patients.push(patient);
      }
    });

    console.log(`✅ Fetched ${patients.length} registered patients`);
    return { success: true, data: patients };
  } catch (error) {
    console.error('❌ Error fetching registered patients:', error);
    return { success: false, error: 'Failed to fetch registered patients' };
  }
}

/**
 * Get all unregistered queue numbers (patients with status 'pending')
 */
export async function getUnregisteredQueue(): Promise<ApiResponse<UnregisteredQueue[]>> {
  try {
    console.log('📊 Fetching unregistered queue from Firestore');

    const dateString = getTodayDateString();
    const patientsRef = collection(db, 'patients');
    const q = query(patientsRef, where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);

    const queue: UnregisteredQueue[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const patientData = docSnapshot.data();
      const createdAt = patientData.createdAt?.toDate();

      // Only include today's patients
      if (createdAt && createdAt.toISOString().split('T')[0] === dateString) {
        queue.push({
          id: docSnapshot.id,
          queueNumber: patientData.queueNumber,
          issuedAt: patientData.issuedAt?.toDate() || createdAt,
        });
      }
    });

    console.log(`✅ Fetched ${queue.length} unregistered queue entries`);
    return { success: true, data: queue };
  } catch (error) {
    console.error('❌ Error fetching unregistered queue:', error);
    return { success: false, error: 'Failed to fetch unregistered queue' };
  }
}

/**
 * Assign patient to room
 */
export async function assignPatientToRoom(
  patientId: string,
  roomId: string
): Promise<ApiResponse<Assignment>> {
  try {
    console.log(`🏥 Assigning patient ${patientId} to room ${roomId}`);

    // Get room and patient documents
    const roomRef = doc(db, 'rooms', roomId);
    const patientRef = doc(db, 'patients', patientId);

    const [roomDoc, patientDoc] = await Promise.all([
      getDoc(roomRef),
      getDoc(patientRef),
    ]);

    if (!roomDoc.exists()) {
      return { success: false, error: 'Room not found' };
    }

    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found' };
    }

    const room = convertTimestamps<Room>({ id: roomDoc.id, ...roomDoc.data() });
    const patient = convertTimestamps<Patient>({ id: patientDoc.id, ...patientDoc.data() });

    // Validate room availability
    if (room.status !== 'available') {
      return { success: false, error: 'Room is not available' };
    }

    // Validate patient status
    if (patient.status !== 'registered') {
      return { success: false, error: 'Patient is not registered or already assigned' };
    }

    // Create assignment
    const assignment: Assignment = {
      id: `assignment-${Date.now()}`,
      patientId,
      roomId,
      assignedAt: new Date(),
      status: 'active',
    };

    // Update room
    await updateDoc(roomRef, {
      status: 'busy',
      currentPatient: {
        id: patient.id,
        queueNumber: patient.queueNumber,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        notes: patient.notes,
      },
      lastUpdated: serverTimestamp(),
    });

    // Update patient
    await updateDoc(patientRef, {
      status: 'assigned',
      assignedAt: serverTimestamp(),
      roomId: roomId,
      calledAt: serverTimestamp(),
    });

    console.log('✅ Patient assigned successfully');
    return { success: true, data: assignment };
  } catch (error) {
    console.error('❌ Error assigning patient:', error);
    return { success: false, error: 'Failed to assign patient to room' };
  }
}

/**
 * Complete consultation
 */
export async function completeConsultation(roomId: string): Promise<ApiResponse<void>> {
  try {
    console.log(`✅ Completing consultation in room ${roomId}`);

    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      return { success: false, error: 'Room not found' };
    }

    const room = convertTimestamps<Room>({ id: roomDoc.id, ...roomDoc.data() });

    if (!room.currentPatient) {
      return { success: false, error: 'No patient in room' };
    }

    // Update patient status
    const patientRef = doc(db, 'patients', room.currentPatient.id);
    await updateDoc(patientRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
    });

    // Clear room
    await updateDoc(roomRef, {
      status: 'available',
      currentPatient: null,
      lastUpdated: serverTimestamp(),
    });

    console.log('✅ Consultation completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error completing consultation:', error);
    return { success: false, error: 'Failed to complete consultation' };
  }
}

/**
 * Toggle room pause
 */
export async function toggleRoomPause(roomId: string): Promise<ApiResponse<Room>> {
  try {
    console.log(`⏸️ Toggling pause for room ${roomId}`);

    const roomRef = doc(db, 'rooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      return { success: false, error: 'Room not found' };
    }

    const room = convertTimestamps<Room>({ id: roomDoc.id, ...roomDoc.data() });

    if (room.currentPatient) {
      return { success: false, error: 'Cannot pause room with patient' };
    }

    const newStatus: RoomStatus = room.status === 'paused' ? 'available' : 'paused';

    await updateDoc(roomRef, {
      status: newStatus,
      lastUpdated: serverTimestamp(),
    });

    const updatedRoom = { ...room, status: newStatus, lastUpdated: new Date() };

    console.log(`✅ Room ${newStatus === 'paused' ? 'paused' : 'unpaused'}`);
    return { success: true, data: updatedRoom };
  } catch (error) {
    console.error('❌ Error toggling room pause:', error);
    return { success: false, error: 'Failed to toggle room pause' };
  }
}

/**
 * Register unregistered patient (update pending patient to registered)
 */
export async function registerPatient(
  queueNumber: number,
  formData: PatientFormData
): Promise<ApiResponse<Patient>> {
  try {
    console.log(`📝 Registering patient with queue number ${queueNumber}`);

    // Find patient by queue number with status 'pending'
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      where('queueNumber', '==', queueNumber),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Queue number not found or already registered' };
    }

    const patientDoc = querySnapshot.docs[0];
    const patientRef = doc(db, 'patients', patientDoc.id);

    // Update patient with registration data
    await updateDoc(patientRef, {
      name: formData.name,
      phone: formData.phone,
      age: formData.age,
      gender: formData.gender,
      notes: formData.notes || '',
      status: 'registered',
      registeredAt: serverTimestamp(),
    });

    // Get updated patient
    const updatedDoc = await getDoc(patientRef);
    const patient = convertTimestamps<Patient>({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });

    console.log('✅ Patient registered successfully');
    return { success: true, data: patient };
  } catch (error) {
    console.error('❌ Error registering patient:', error);
    return { success: false, error: 'Failed to register patient' };
  }
}

/**
 * Update patient details
 */
export async function updatePatient(
  patientId: string,
  updates: Partial<PatientFormData>
): Promise<ApiResponse<Patient>> {
  try {
    console.log(`✏️ Updating patient ${patientId}`);

    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found' };
    }

    // Update patient fields
    await updateDoc(patientRef, {
      ...updates,
      lastUpdated: serverTimestamp(),
    });

    // Get updated patient
    const updatedDoc = await getDoc(patientRef);
    const patient = convertTimestamps<Patient>({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });

    console.log('✅ Patient updated successfully');
    return { success: true, data: patient };
  } catch (error) {
    console.error('❌ Error updating patient:', error);
    return { success: false, error: 'Failed to update patient' };
  }
}

/**
 * Cancel patient
 */
export async function cancelPatient(
  patientId: string,
  reason: string
): Promise<ApiResponse<void>> {
  try {
    console.log(`❌ Cancelling patient ${patientId}`);

    const patientRef = doc(db, 'patients', patientId);
    const patientDoc = await getDoc(patientRef);

    if (!patientDoc.exists()) {
      return { success: false, error: 'Patient not found' };
    }

    const patient = patientDoc.data();
    const currentNotes = patient.notes || '';

    await updateDoc(patientRef, {
      status: 'cancelled',
      notes: `${currentNotes}\nCancelled: ${reason}`.trim(),
      cancelledAt: serverTimestamp(),
    });

    console.log('✅ Patient cancelled successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error cancelling patient:', error);
    return { success: false, error: 'Failed to cancel patient' };
  }
}

/**
 * Debug: Initialize sample rooms in Firestore
 */
export async function initializeSampleRooms() {
  try {
    console.log('🏥 Initializing sample rooms in Firestore');

    const sampleRooms = [
      {
        id: 'room-1',
        roomNumber: '101',
        doctorName: 'Dr. Sarah Johnson',
        status: 'available' as RoomStatus,
        currentPatient: null,
      },
      {
        id: 'room-2',
        roomNumber: '102',
        doctorName: 'Dr. Michael Chen',
        status: 'available' as RoomStatus,
        currentPatient: null,
      },
      {
        id: 'room-3',
        roomNumber: '103',
        doctorName: 'Dr. Emily Rodriguez',
        status: 'available' as RoomStatus,
        currentPatient: null,
      },
      {
        id: 'room-4',
        roomNumber: '104',
        doctorName: 'Dr. James Williams',
        status: 'available' as RoomStatus,
        currentPatient: null,
      },
      {
        id: 'room-5',
        roomNumber: '105',
        doctorName: 'Dr. Lisa Anderson',
        status: 'available' as RoomStatus,
        currentPatient: null,
      },
    ];

    for (const room of sampleRooms) {
      const roomRef = doc(db, 'rooms', room.id);
      await setDoc(roomRef, {
        ...room,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    console.log('✅ Sample rooms initialized');
  } catch (error) {
    console.error('❌ Error initializing sample rooms:', error);
  }
}

// Expose debug function globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).initRooms = initializeSampleRooms;
  console.log('🔧 Debug commands available:');
  console.log('  - window.initRooms() - Initialize sample rooms in Firestore');
}
