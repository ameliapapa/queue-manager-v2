import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all Cloud Functions
export { generateQueueNumber } from './queue/generateQueueNumber';
export { resetDailyQueue } from './queue/resetDailyQueue';
export { generatePrintTicket } from './queue/generatePrintTicket';
