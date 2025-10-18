import { Timestamp } from 'firebase/firestore';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  PAUSED = 'paused'
}

export interface Room {
  id: string;
  roomNumber: number;
  doctorName: string;
  status: RoomStatus;
  currentPatientQueue: number | null;
  updatedAt: Timestamp;
}

export interface CreateRoomRequest {
  roomNumber: number;
  doctorName: string;
}

export interface UpdateRoomRequest {
  roomId: string;
  data: Partial<Room>;
}

export interface AssignPatientToRoomRequest {
  patientId: string;
  roomId: string;
  queueNumber: number;
}
