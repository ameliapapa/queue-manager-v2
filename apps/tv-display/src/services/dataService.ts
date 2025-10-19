import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

export interface Patient {
  id: string;
  queueNumber: number;
  name?: string;
  phone?: string;
  age?: number;
  gender?: string;
  status: 'pending' | 'registered' | 'called' | 'completed';
  roomNumber?: number;
  registeredAt?: Date;
  calledAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
}

export interface Room {
  number: number;
  status: 'available' | 'occupied' | 'cleaning';
  currentPatient?: Patient;
}

/**
 * Get all patients for today
 */
export async function getAllPatients(): Promise<Patient[]> {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      orderBy('queueNumber', 'asc'),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    const patients: Patient[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      patients.push({
        id: doc.id,
        queueNumber: data.queueNumber,
        name: data.name,
        phone: data.phone,
        age: data.age,
        gender: data.gender,
        status: data.status || 'pending',
        roomNumber: data.roomNumber,
        registeredAt: data.registeredAt?.toDate(),
        calledAt: data.calledAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        createdAt: data.createdAt?.toDate(),
      });
    });

    return patients;
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

/**
 * Get patients currently in rooms (status: called)
 */
export function getPatientsInRooms(patients: Patient[]): Patient[] {
  return patients
    .filter((p) => p.status === 'called' && p.roomNumber)
    .sort((a, b) => (a.roomNumber || 0) - (b.roomNumber || 0));
}

/**
 * Get registered patients waiting to be called
 */
export function getRegisteredWaitingPatients(patients: Patient[]): Patient[] {
  return patients
    .filter((p) => p.status === 'registered' && p.name)
    .sort((a, b) => a.queueNumber - b.queueNumber);
}

/**
 * Get unregistered patients (pending status, no name)
 */
export function getUnregisteredPatients(patients: Patient[]): Patient[] {
  return patients
    .filter((p) => p.status === 'pending' || !p.name)
    .sort((a, b) => a.queueNumber - b.queueNumber);
}

/**
 * Get room status for all 5 doctor rooms
 */
export function getRoomStatuses(patients: Patient[]): Room[] {
  const rooms: Room[] = [];

  for (let i = 1; i <= 5; i++) {
    const patientInRoom = patients.find(
      (p) => p.status === 'called' && p.roomNumber === i
    );

    rooms.push({
      number: i,
      status: patientInRoom ? 'occupied' : 'available',
      currentPatient: patientInRoom,
    });
  }

  return rooms;
}
