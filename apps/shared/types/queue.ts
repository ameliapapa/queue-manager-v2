import { Timestamp } from 'firebase/firestore';

export interface QueueCounter {
  date: string; // YYYY-MM-DD
  currentNumber: number;
  updatedAt: Timestamp;
}

export interface QueueStats {
  totalToday: number;
  pending: number;
  registered: number;
  assigned: number;
  completed: number;
}

export interface GenerateQueueNumberResponse {
  queueNumber: number;
  qrCodeUrl: string;
  patientId: string;
  registrationUrl: string;
}
