"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrintTicket = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const qrGenerator_1 = require("../utils/qrGenerator");
const pdfGenerator_1 = require("../utils/pdfGenerator");
const HOSPITAL_NAME = process.env.HOSPITAL_NAME || 'City General Hospital';
const QR_CODE_SIZE = parseInt(process.env.QR_CODE_SIZE || '200', 10);
/**
 * Cloud Function to generate a printable ticket with QR code
 * This is called from the Kiosk app after generating a queue number
 */
exports.generatePrintTicket = functions.https.onCall(async (data, context) => {
    const { queueNumber, registrationUrl, patientId } = data;
    // Validate input
    if (!queueNumber || !registrationUrl || !patientId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: queueNumber, registrationUrl, patientId');
    }
    try {
        const db = admin.firestore();
        // Generate QR code
        const qrCodeDataUrl = await (0, qrGenerator_1.generateQRCode)(registrationUrl, QR_CODE_SIZE);
        // Get formatted timestamp
        const timestamp = (0, pdfGenerator_1.getFormattedTimestamp)();
        // Generate ticket HTML
        const ticketHtml = (0, pdfGenerator_1.generateTicketHTML)(queueNumber, qrCodeDataUrl, timestamp, HOSPITAL_NAME);
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
    }
    catch (error) {
        console.error('Error generating print ticket:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate print ticket', error.message);
    }
});
//# sourceMappingURL=generatePrintTicket.js.map