/**
 * Mock API Service
 * Simulates backend operations with localStorage persistence
 */

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

// Storage keys
const STORAGE_KEYS = {
  ROOMS: 'dashboard-rooms',
  PATIENTS: 'dashboard-patients',
  UNREGISTERED: 'dashboard-unregistered',
  ASSIGNMENTS: 'dashboard-assignments',
};

// Initialize sample data
function initializeSampleData() {
  if (!localStorage.getItem(STORAGE_KEYS.ROOMS)) {
    const sampleRooms: Room[] = [
      {
        id: 'room-1',
        roomNumber: '101',
        doctorName: 'Dr. Sarah Johnson',
        status: 'available',
        currentPatient: null,
        lastUpdated: new Date(),
      },
      {
        id: 'room-2',
        roomNumber: '102',
        doctorName: 'Dr. Michael Chen',
        status: 'available',
        currentPatient: null,
        lastUpdated: new Date(),
      },
      {
        id: 'room-3',
        roomNumber: '103',
        doctorName: 'Dr. Emily Rodriguez',
        status: 'available',
        currentPatient: null,
        lastUpdated: new Date(),
      },
      {
        id: 'room-4',
        roomNumber: '104',
        doctorName: 'Dr. James Williams',
        status: 'available',
        currentPatient: null,
        lastUpdated: new Date(),
      },
      {
        id: 'room-5',
        roomNumber: '105',
        doctorName: 'Dr. Lisa Anderson',
        status: 'available',
        currentPatient: null,
        lastUpdated: new Date(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(sampleRooms));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const samplePatients: Patient[] = [
      {
        id: 'patient-1',
        queueNumber: 1,
        name: 'John Doe',
        phone: '555-0101',
        age: 45,
        gender: 'male',
        notes: 'Diabetes checkup',
        status: 'registered',
        registeredAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      },
      {
        id: 'patient-2',
        queueNumber: 2,
        name: 'Jane Smith',
        phone: '555-0102',
        age: 32,
        gender: 'female',
        notes: '',
        status: 'registered',
        registeredAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
      },
      {
        id: 'patient-3',
        queueNumber: 3,
        name: 'Robert Brown',
        phone: '555-0103',
        age: 67,
        gender: 'male',
        notes: 'Blood pressure monitoring',
        status: 'registered',
        registeredAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      },
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(samplePatients));
  }

  if (!localStorage.getItem(STORAGE_KEYS.UNREGISTERED)) {
    const sampleUnregistered: UnregisteredQueue[] = [
      {
        id: 'unreg-4',
        queueNumber: 4,
        issuedAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago (urgent)
      },
      {
        id: 'unreg-5',
        queueNumber: 5,
        issuedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 mins ago
      },
      {
        id: 'unreg-6',
        queueNumber: 6,
        issuedAt: new Date(Date.now() - 8 * 60 * 1000), // 8 mins ago
      },
    ];
    localStorage.setItem(STORAGE_KEYS.UNREGISTERED, JSON.stringify(sampleUnregistered));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
  }
}

// Initialize on load
initializeSampleData();

// Helper: Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Parse dates from localStorage
function parseDates<T>(data: T): T {
  return JSON.parse(JSON.stringify(data), (key, value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return new Date(value);
    }
    return value;
  });
}

/**
 * Get all rooms
 */
export async function getRooms(): Promise<ApiResponse<Room[]>> {
  await delay();
  const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
  if (!data) return { success: false, error: 'No rooms found' };

  const rooms = parseDates<Room[]>(JSON.parse(data));
  return { success: true, data: rooms };
}

/**
 * Get all registered patients
 */
export async function getRegisteredPatients(): Promise<ApiResponse<Patient[]>> {
  await delay();
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!data) return { success: true, data: [] };

  const patients = parseDates<Patient[]>(JSON.parse(data));
  const registered = patients.filter(p => p.status === 'registered');
  return { success: true, data: registered };
}

/**
 * Get all unregistered queue numbers
 */
export async function getUnregisteredQueue(): Promise<ApiResponse<UnregisteredQueue[]>> {
  await delay();
  const data = localStorage.getItem(STORAGE_KEYS.UNREGISTERED);
  if (!data) return { success: true, data: [] };

  const queue = parseDates<UnregisteredQueue[]>(JSON.parse(data));
  return { success: true, data: queue };
}

/**
 * Assign patient to room
 */
export async function assignPatientToRoom(
  patientId: string,
  roomId: string
): Promise<ApiResponse<Assignment>> {
  await delay();

  // Get current data
  const roomsData = localStorage.getItem(STORAGE_KEYS.ROOMS);
  const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  const assignmentsData = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);

  if (!roomsData || !patientsData || !assignmentsData) {
    return { success: false, error: 'Data not found' };
  }

  const rooms = JSON.parse(roomsData);
  const patients = JSON.parse(patientsData);
  const assignments = JSON.parse(assignmentsData);

  // Find room and patient
  const room = rooms.find((r: Room) => r.id === roomId);
  const patient = patients.find((p: Patient) => p.id === patientId);

  if (!room) return { success: false, error: 'Room not found' };
  if (!patient) return { success: false, error: 'Patient not found' };
  if (room.status !== 'available') return { success: false, error: 'Room is not available' };
  if (patient.status !== 'registered') return { success: false, error: 'Patient already assigned' };

  // Create assignment
  const assignment: Assignment = {
    id: `assignment-${Date.now()}`,
    patientId,
    roomId,
    assignedAt: new Date(),
    status: 'active',
  };

  // Update room
  room.status = 'busy';
  room.currentPatient = patient;
  room.lastUpdated = new Date();

  // Update patient
  patient.status = 'assigned';
  patient.assignedAt = new Date();
  patient.roomId = roomId;

  // Save changes
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([...assignments, assignment]));

  return { success: true, data: assignment };
}

/**
 * Complete consultation
 */
export async function completeConsultation(roomId: string): Promise<ApiResponse<void>> {
  await delay();

  const roomsData = localStorage.getItem(STORAGE_KEYS.ROOMS);
  const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  const assignmentsData = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);

  if (!roomsData || !patientsData || !assignmentsData) {
    return { success: false, error: 'Data not found' };
  }

  const rooms = JSON.parse(roomsData);
  const patients = JSON.parse(patientsData);
  const assignments = JSON.parse(assignmentsData);

  const room = rooms.find((r: Room) => r.id === roomId);
  if (!room || !room.currentPatient) {
    return { success: false, error: 'No patient in room' };
  }

  // Find and update assignment
  const assignment = assignments.find(
    (a: Assignment) => a.roomId === roomId && a.status === 'active'
  );
  if (assignment) {
    assignment.status = 'completed';
    assignment.completedAt = new Date();
  }

  // Update patient
  const patient = patients.find((p: Patient) => p.id === room.currentPatient.id);
  if (patient) {
    patient.status = 'completed';
    patient.completedAt = new Date();
  }

  // Clear room
  room.status = 'available';
  room.currentPatient = null;
  room.lastUpdated = new Date();

  // Save changes
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(assignments));

  return { success: true };
}

/**
 * Toggle room pause
 */
export async function toggleRoomPause(roomId: string): Promise<ApiResponse<Room>> {
  await delay();

  const roomsData = localStorage.getItem(STORAGE_KEYS.ROOMS);
  if (!roomsData) return { success: false, error: 'Rooms not found' };

  const rooms = JSON.parse(roomsData);
  const room = rooms.find((r: Room) => r.id === roomId);

  if (!room) return { success: false, error: 'Room not found' };
  if (room.currentPatient) return { success: false, error: 'Cannot pause room with patient' };

  room.status = room.status === 'paused' ? 'available' : 'paused';
  room.lastUpdated = new Date();

  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

  return { success: true, data: room };
}

/**
 * Register unregistered patient
 */
export async function registerPatient(
  queueNumber: number,
  formData: PatientFormData
): Promise<ApiResponse<Patient>> {
  await delay();

  const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  const unregisteredData = localStorage.getItem(STORAGE_KEYS.UNREGISTERED);

  if (!patientsData || !unregisteredData) {
    return { success: false, error: 'Data not found' };
  }

  const patients = JSON.parse(patientsData);
  const unregistered = JSON.parse(unregisteredData);

  // Check if queue number exists in unregistered list
  const queueIndex = unregistered.findIndex(
    (q: UnregisteredQueue) => q.queueNumber === queueNumber
  );

  if (queueIndex === -1) {
    return { success: false, error: 'Queue number not found' };
  }

  // Create patient
  const patient: Patient = {
    id: `patient-${Date.now()}`,
    queueNumber,
    ...formData,
    status: 'registered',
    registeredAt: new Date(),
  };

  // Remove from unregistered
  unregistered.splice(queueIndex, 1);

  // Add to patients
  patients.push(patient);

  // Save changes
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  localStorage.setItem(STORAGE_KEYS.UNREGISTERED, JSON.stringify(unregistered));

  return { success: true, data: patient };
}

/**
 * Update patient details
 */
export async function updatePatient(
  patientId: string,
  updates: Partial<PatientFormData>
): Promise<ApiResponse<Patient>> {
  await delay();

  const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!patientsData) return { success: false, error: 'Patients not found' };

  const patients = JSON.parse(patientsData);
  const patient = patients.find((p: Patient) => p.id === patientId);

  if (!patient) return { success: false, error: 'Patient not found' };

  // Update fields
  Object.assign(patient, updates);

  // Add to edit history
  if (!patient.editHistory) patient.editHistory = [];
  patient.editHistory.push({
    timestamp: new Date(),
    receptionistId: 'receptionist-1', // TODO: Get from auth
    field: Object.keys(updates).join(', '),
    oldValue: 'previous',
    newValue: 'current',
  });

  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));

  return { success: true, data: patient };
}

/**
 * Cancel patient
 */
export async function cancelPatient(
  patientId: string,
  reason: string
): Promise<ApiResponse<void>> {
  await delay();

  const patientsData = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  if (!patientsData) return { success: false, error: 'Patients not found' };

  const patients = JSON.parse(patientsData);
  const patient = patients.find((p: Patient) => p.id === patientId);

  if (!patient) return { success: false, error: 'Patient not found' };

  patient.status = 'cancelled';
  patient.notes = `${patient.notes || ''}\nCancelled: ${reason}`;

  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));

  return { success: true };
}

/**
 * Debug: Reset all data
 */
export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeSampleData();
  console.log('✅ Dashboard data reset to sample data');
}

// Expose debug function
(window as any).resetDashboardData = resetAllData;
