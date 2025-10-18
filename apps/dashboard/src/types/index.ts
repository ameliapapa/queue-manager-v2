/**
 * Type definitions for Hospital Queue Management Dashboard
 */

// Room Status
export type RoomStatus = 'available' | 'busy' | 'paused';

// Patient Status
export type PatientStatus = 'waiting' | 'registered' | 'assigned' | 'consulting' | 'completed' | 'cancelled';

// Queue Number Status
export type QueueStatus = 'unregistered' | 'registered' | 'assigned' | 'completed' | 'cancelled';

// Gender Options
export type Gender = 'male' | 'female' | 'other';

/**
 * Doctor Room
 */
export interface Room {
  id: string;
  roomNumber: string;
  doctorName: string;
  status: RoomStatus;
  currentPatient: Patient | null;
  lastUpdated: Date;
}

/**
 * Patient Information
 */
export interface Patient {
  id: string;
  queueNumber: number;
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  notes?: string;
  status: PatientStatus;
  registeredAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
  roomId?: string;
  editHistory?: EditHistoryEntry[];
}

/**
 * Unregistered Queue Number
 */
export interface UnregisteredQueue {
  id: string;
  queueNumber: number;
  issuedAt: Date;
  patientId?: string;
}

/**
 * Patient Assignment
 */
export interface Assignment {
  id: string;
  patientId: string;
  roomId: string;
  assignedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed';
}

/**
 * Edit History Entry
 */
export interface EditHistoryEntry {
  timestamp: Date;
  receptionistId: string;
  field: string;
  oldValue: string;
  newValue: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  autoClose?: boolean;
}

/**
 * WebSocket Event Types
 */
export type WebSocketEvent =
  | { type: 'queue_number_issued'; data: UnregisteredQueue }
  | { type: 'patient_registered'; data: Patient }
  | { type: 'patient_assigned'; data: Assignment }
  | { type: 'consultation_completed'; data: { assignmentId: string; roomId: string } }
  | { type: 'room_status_changed'; data: { roomId: string; status: RoomStatus } }
  | { type: 'patient_cancelled'; data: { patientId: string; reason: string } };

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Dashboard State
 */
export interface DashboardState {
  rooms: Room[];
  registeredPatients: Patient[];
  unregisteredQueue: UnregisteredQueue[];
  assignments: Assignment[];
  isConnected: boolean;
  lastSync: Date | null;
}

/**
 * Form Data Types
 */
export interface PatientFormData {
  name: string;
  phone: string;
  age: number;
  gender: Gender;
  notes?: string;
}

export interface CancellationData {
  reason: string;
  notes?: string;
}

/**
 * Filter and Search Types
 */
export interface QueueFilters {
  searchTerm: string;
  sortBy: 'queueNumber' | 'registeredAt' | 'age';
  sortOrder: 'asc' | 'desc';
}

/**
 * Keyboard Shortcut Actions
 */
export type KeyboardAction =
  | 'select_room_1'
  | 'select_room_2'
  | 'select_room_3'
  | 'select_room_4'
  | 'select_room_5'
  | 'assign_patient'
  | 'close_modal';
