import { Timestamp } from 'firebase/firestore';

export enum PatientStatus {
  UNREGISTERED = 'unregistered',
  REGISTERED = 'registered',
  ASSIGNED = 'assigned',
  COMPLETED = 'completed'
}

export interface Patient {
  id?: string; // Document ID
  queueNumber: number;
  status: PatientStatus;
  name: string | null;
  phone: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  notes: string | null;
  createdAt: Timestamp;
  registeredAt: Timestamp | null;
  assignedAt: Timestamp | null;
  completedAt: Timestamp | null;
  assignedRoomId: string | null;
  qrCodeUrl: string;
  printedAt: Timestamp | null;
}

export interface PatientFormData {
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  notes: string;
}

export interface CreatePatientRequest {
  queueNumber: number;
  registrationUrl: string;
}

export interface UpdatePatientRequest {
  patientId: string;
  data: Partial<Patient>;
}
