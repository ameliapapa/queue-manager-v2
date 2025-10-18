import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { generateQRCode } from '../utils/qrGenerator';
import { generateTicketHTML, getFormattedTimestamp } from '../utils/pdfGenerator';

const HOSPITAL_NAME = process.env.HOSPITAL_NAME || 'City General Hospital';
const QR_CODE_SIZE = parseInt(process.env.QR_CODE_SIZE || '200', 10);

interface GeneratePrintTicketRequest {
  queueNumber: number;
  registrationUrl: string;
  patientId: string;
}

/**
 * Cloud Function to generate a printable ticket with QR code
 * This is called from the Kiosk app after generating a queue number
 */
export const generatePrintTicket = functions.https.onCall(
  async (data: GeneratePrintTicketRequest, context) => {
    const { queueNumber, registrationUrl, patientId } = data;

    // Validate input
    if (!queueNumber || !registrationUrl || !patientId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: queueNumber, registrationUrl, patientId'
      );
    }

    try {
      const db = admin.firestore();

      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(registrationUrl, QR_CODE_SIZE);

      // Get formatted timestamp
      const timestamp = getFormattedTimestamp();

      // Generate ticket HTML
      const ticketHtml = generateTicketHTML(
        queueNumber,
        qrCodeDataUrl,
        timestamp,
        HOSPITAL_NAME
      );

      // Create print job record
      const printJobRef = db.collection('printJobs').doc();
      await printJobRef.set({
        queueNumber: queueNumber,
        patientId: patientId,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        printedAt: null,
        error: null,
      });

      // Update patient document with print timestamp
      const patientRef = db.collection('patients').doc(patientId);
      await patientRef.update({
        printedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Generated print ticket for queue number ${queueNumber}`);

      return {
        success: true,
        ticketHtml: ticketHtml,
        qrCodeDataUrl: qrCodeDataUrl,
        printJobId: printJobRef.id,
        timestamp: timestamp,
      };
    } catch (error: any) {
      console.error('Error generating print ticket:', error);

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate print ticket',
        error.message
      );
    }
  }
);
