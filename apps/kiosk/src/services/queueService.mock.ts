import QRCode from 'qrcode';
import { websocketClient } from './websocket';

/**
 * Queue Service - Pure Mock Mode
 * Uses localStorage for persistent mock data without Firebase
 */

// Mock counter stored in memory
let queueCounter = 0;

// Storage keys
const STORAGE_KEY = 'hospital-queue-counter';
const PATIENTS_KEY = 'hospital-queue-patients';

// Initialize counter from localStorage on load
const savedCounter = localStorage.getItem(STORAGE_KEY);
if (savedCounter) {
  queueCounter = parseInt(savedCounter, 10);
  console.log('📊 Loaded queue counter from localStorage:', queueCounter);
}

interface GenerateQueueNumberResult {
  success: boolean;
  queueNumber: number;
  patientId: string;
  registrationUrl: string;
  qrCodeDataUrl: string;
}

/**
 * Generate a new queue number (PURE MOCK MODE)
 * @returns Promise with queue number data
 */
export async function generateQueueNumber(): Promise<GenerateQueueNumberResult> {
  console.log('🎯 Generating queue number in PURE MOCK MODE');

  // Simulate network delay (realistic UX)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Increment counter
  queueCounter++;

  // Save to localStorage for persistence
  localStorage.setItem(STORAGE_KEY, queueCounter.toString());

  // Generate patient ID
  const patientId = `mock-patient-${queueCounter}-${Date.now()}`;

  // Generate registration URL (points to patient registration app)
  const registrationUrl = `${window.location.protocol}//${window.location.hostname}:3002/register?queue=${queueCounter}`;

  console.log('✅ Queue number generated:', queueCounter);
  console.log('📱 Registration URL:', registrationUrl);

  // Generate QR code
  let qrCodeDataUrl: string;
  try {
    qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    console.log('✅ QR code generated');
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    // Fallback to simple data URL
    qrCodeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }

  // Store patient in mock database
  savePatientToMockDB(queueCounter, patientId, registrationUrl);

  // Emit WebSocket event for real-time updates
  websocketClient.emitQueueIssued({
    queueNumber: queueCounter,
    issuedAt: new Date(),
    patientId,
  });

  return {
    success: true,
    queueNumber: queueCounter,
    patientId,
    registrationUrl,
    qrCodeDataUrl,
  };
}

/**
 * Save patient to mock localStorage database
 */
function savePatientToMockDB(
  queueNumber: number,
  patientId: string,
  registrationUrl: string
) {
  // Get existing patients
  const patientsJSON = localStorage.getItem(PATIENTS_KEY);
  const patients = patientsJSON ? JSON.parse(patientsJSON) : {};

  // Add new patient
  patients[queueNumber] = {
    id: patientId,
    queueNumber,
    status: 'unregistered',
    name: null,
    phone: null,
    age: null,
    gender: null,
    notes: null,
    createdAt: new Date().toISOString(),
    registeredAt: null,
    assignedAt: null,
    completedAt: null,
    assignedRoomId: null,
    qrCodeUrl: registrationUrl,
    printedAt: new Date().toISOString(),
  };

  // Save back to localStorage
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));

  console.log('💾 Patient saved to mock database:', {
    queueNumber,
    patientId,
    status: 'unregistered',
  });
}

/**
 * Get current queue stats from mock localStorage database
 * @returns Promise with queue statistics
 */
export async function getQueueStats(): Promise<{
  totalToday: number;
  pending: number;
  registered: number;
}> {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Get patients from localStorage
    const patientsJSON = localStorage.getItem(PATIENTS_KEY);
    const patients = patientsJSON ? JSON.parse(patientsJSON) : {};

    let totalToday = 0;
    let pending = 0;
    let registered = 0;

    // Count patients by status
    Object.values(patients).forEach((patient: any) => {
      totalToday++;
      if (patient.status === 'unregistered') {
        pending++;
      } else if (patient.status === 'registered') {
        registered++;
      }
    });

    console.log('📊 Queue stats:', { totalToday, pending, registered });

    return {
      totalToday,
      pending,
      registered,
    };
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    return {
      totalToday: 0,
      pending: 0,
      registered: 0,
    };
  }
}

/**
 * Reset queue counter (useful for testing)
 */
export function resetQueueCounter() {
  queueCounter = 0;
  localStorage.setItem(STORAGE_KEY, '0');
  localStorage.removeItem(PATIENTS_KEY);
  console.log('🔄 Queue counter reset to 0');
  console.log('🗑️  All mock patients cleared');
}

/**
 * Get all patients from mock database
 */
export function getAllPatients() {
  const patientsJSON = localStorage.getItem(PATIENTS_KEY);
  return patientsJSON ? JSON.parse(patientsJSON) : {};
}

/**
 * Debug: Log all mock data
 */
export function debugMockData() {
  console.log('=== MOCK DATABASE DEBUG ===');
  console.log('Current Queue Counter:', queueCounter);
  console.log('localStorage Counter:', localStorage.getItem(STORAGE_KEY));
  console.log('All Patients:', getAllPatients());
  console.log('========================');
}

// Expose reset function globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).resetQueue = resetQueueCounter;
  (window as any).debugQueue = debugMockData;
  console.log('🔧 Debug commands available:');
  console.log('  - window.resetQueue() - Reset queue to 0');
  console.log('  - window.debugQueue() - Show mock database');
}
