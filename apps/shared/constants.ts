// Hospital Configuration
export const HOSPITAL_CONFIG = {
  name: 'City General Hospital',
  totalRooms: 5,
  maxPatientsPerDay: 100,
  queueResetTime: '00:00', // Midnight
} as const;

// Collection Names
export const COLLECTIONS = {
  patients: 'patients',
  rooms: 'rooms',
  queueCounter: 'queueCounter',
  users: 'users',
  printJobs: 'printJobs',
} as const;

// Queue Configuration
export const QUEUE_CONFIG = {
  startNumber: 1,
  maxNumber: 999,
  numberPrefix: 'Q',
} as const;

// Registration URLs
// For development: http://localhost:3002
// For production: Set VITE_REGISTRATION_URL in .env
// export const REGISTRATION_BASE_URL = import.meta.env.VITE_REGISTRATION_URL ||
//  'http://localhost:3002';

// Print Configuration
export const PRINT_CONFIG = {
  defaultPrinterName: 'thermal-printer',
  paperWidth: 80, // mm (standard thermal printer)
  paperHeight: 120, // mm
  margin: 5, // mm
  dpi: 203, // Standard thermal printer DPI
  qrCodeSize: 200, // pixels
} as const;

// Ticket Template
export const TICKET_TEMPLATE = {
  hospitalName: HOSPITAL_CONFIG.name,
  instructions: 'Please scan the QR code to complete your registration',
  footer: 'Thank you for your patience',
} as const;

// Real-time Update Intervals
export const UPDATE_INTERVALS = {
  tvDisplay: 5000, // 5 seconds
  dashboard: 3000, // 3 seconds
  kiosk: 10000, // 10 seconds
} as const;

// Validation Rules
export const VALIDATION = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  phone: {
    pattern: /^[0-9]{10}$/,
    message: 'Please enter a valid 10-digit phone number',
  },
  age: {
    min: 0,
    max: 150,
  },
  notes: {
    maxLength: 500,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  networkError: 'Network error. Please check your connection.',
  queueFull: 'Queue is full for today. Please try tomorrow.',
  invalidQRCode: 'Invalid QR code. Please get a new ticket from the kiosk.',
  alreadyRegistered: 'This queue number is already registered.',
  printerError: 'Printer error. Please contact staff for assistance.',
  permissionDenied: 'You do not have permission to perform this action.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  queueNumberGenerated: 'Queue number generated successfully',
  registrationComplete: 'Registration completed successfully',
  patientAssigned: 'Patient assigned to room',
  patientCompleted: 'Patient marked as completed',
} as const;
