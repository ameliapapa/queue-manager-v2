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
exports.generateQueueNumber = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const REGISTRATION_BASE_URL = process.env.REGISTRATION_BASE_URL || 'https://your-project-id-patient.web.app';
const QUEUE_START_NUMBER = parseInt(process.env.QUEUE_START_NUMBER || '1', 10);
const MAX_QUEUE_NUMBER = parseInt(process.env.MAX_QUEUE_NUMBER || '999', 10);
/**
 * Cloud Function to generate a new queue number
 * This is called from the Kiosk app when a patient requests a queue number
 */
exports.generateQueueNumber = functions.https.onCall(async (data, context) => {
    const db = admin.firestore();
    try {
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        // Use transaction to ensure atomic increment
        const result = await db.runTransaction(async (transaction) => {
            const counterRef = db.collection('queueCounter').doc(today);
            const counterDoc = await transaction.get(counterRef);
            let currentNumber;
            if (!counterDoc.exists) {
                // First queue number of the day
                currentNumber = QUEUE_START_NUMBER;
                transaction.set(counterRef, {
                    date: today,
                    currentNumber: currentNumber,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            else {
                // Increment existing counter
                const counterData = counterDoc.data();
                currentNumber = ((counterData === null || counterData === void 0 ? void 0 : counterData.currentNumber) || 0) + 1;
                // Check if we've exceeded max queue number
                if (currentNumber > MAX_QUEUE_NUMBER) {
                    throw new functions.https.HttpsError('resource-exhausted', 'Queue is full for today. Please try tomorrow.');
                }
                transaction.update(counterRef, {
                    currentNumber: currentNumber,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            // Create registration URL with queue number as parameter
            const registrationUrl = `${REGISTRATION_BASE_URL}?q=${currentNumber}`;
            // Create patient document
            const patientRef = db.collection('patients').doc();
            transaction.set(patientRef, {
                queueNumber: currentNumber,
                status: 'unregistered',
                name: null,
                phone: null,
                age: null,
                gender: null,
                notes: null,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                registeredAt: null,
                assignedAt: null,
                completedAt: null,
                assignedRoomId: null,
                qrCodeUrl: registrationUrl,
                printedAt: null,
            });
            return {
                queueNumber: currentNumber,
                patientId: patientRef.id,
                registrationUrl: registrationUrl,
            };
        });
        console.log(`Generated queue number ${result.queueNumber} for patient ${result.patientId}`);
        return {
            success: true,
            queueNumber: result.queueNumber,
            patientId: result.patientId,
            registrationUrl: result.registrationUrl,
        };
    }
    catch (error) {
        console.error('Error generating queue number:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'Failed to generate queue number', error.message);
    }
});
//# sourceMappingURL=generateQueueNumber.js.map