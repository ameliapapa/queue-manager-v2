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
exports.resetDailyQueue = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const QUEUE_RESET_HOUR = parseInt(process.env.QUEUE_RESET_HOUR || '0', 10);
/**
 * Scheduled Cloud Function to reset the queue counter daily at midnight
 * This runs automatically every day at the specified hour (default: midnight)
 *
 * UPDATED: Now includes automatic cleanup of old patient data
 * - Deletes ALL patients from previous days
 * - Deletes old queue counter documents
 * - Resets rooms to available status
 */
exports.resetDailyQueue = functions.pubsub
    .schedule(`0 ${QUEUE_RESET_HOUR} * * *`)
    .timeZone('America/New_York') // Change to your timezone
    .onRun(async (context) => {
    var _a;
    const db = admin.firestore();
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`🧹 Starting daily queue reset and cleanup for ${today}`);
        // Step 1: Delete ALL old patients (from previous days)
        console.log('Step 1: Cleaning up old patients...');
        const patientsSnapshot = await db.collection('patients').get();
        let deletedPatientsCount = 0;
        let keptPatientsCount = 0;
        // Use batched writes for better performance (Firestore limit: 500 operations per batch)
        let batch = db.batch();
        let operationCount = 0;
        const BATCH_SIZE = 500;
        for (const patientDoc of patientsSnapshot.docs) {
            const data = patientDoc.data();
            const createdAt = (_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate();
            const createdDateString = createdAt ? createdAt.toISOString().split('T')[0] : null;
            if (createdDateString !== today) {
                // Delete old patient
                batch.delete(patientDoc.ref);
                deletedPatientsCount++;
                operationCount++;
                // Commit batch if we hit the limit
                if (operationCount >= BATCH_SIZE) {
                    await batch.commit();
                    batch = db.batch();
                    operationCount = 0;
                }
            }
            else {
                keptPatientsCount++;
            }
        }
        // Commit any remaining operations
        if (operationCount > 0) {
            await batch.commit();
        }
        console.log(`✅ Patients cleanup: Deleted ${deletedPatientsCount}, Kept ${keptPatientsCount}`);
        // Step 2: Delete old queue counter documents
        console.log('Step 2: Cleaning up old queue counters...');
        const countersSnapshot = await db.collection('queueCounter').get();
        let deletedCountersCount = 0;
        let keptCountersCount = 0;
        batch = db.batch();
        operationCount = 0;
        for (const counterDoc of countersSnapshot.docs) {
            const counterDate = counterDoc.id; // Document ID is the date (YYYY-MM-DD)
            if (counterDate !== today) {
                batch.delete(counterDoc.ref);
                deletedCountersCount++;
                operationCount++;
                if (operationCount >= BATCH_SIZE) {
                    await batch.commit();
                    batch = db.batch();
                    operationCount = 0;
                }
            }
            else {
                keptCountersCount++;
            }
        }
        if (operationCount > 0) {
            await batch.commit();
        }
        console.log(`✅ Counters cleanup: Deleted ${deletedCountersCount}, Kept ${keptCountersCount}`);
        // Step 3: Reset room statuses
        console.log('Step 3: Resetting room statuses...');
        const roomsSnapshot = await db.collection('rooms').get();
        batch = db.batch();
        roomsSnapshot.forEach((doc) => {
            batch.update(doc.ref, {
                status: 'available',
                currentPatientQueue: null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        if (!roomsSnapshot.empty) {
            await batch.commit();
            console.log(`✅ Reset ${roomsSnapshot.size} rooms to available status`);
        }
        // Final summary
        console.log('═══════════════════════════════════════');
        console.log(`✅ Daily queue reset and cleanup completed successfully for ${today}`);
        console.log(`📊 Patients Deleted: ${deletedPatientsCount}`);
        console.log(`📊 Patients Kept: ${keptPatientsCount}`);
        console.log(`📊 Queue Counters Deleted: ${deletedCountersCount}`);
        console.log(`📊 Rooms Reset: ${roomsSnapshot.size}`);
        console.log('═══════════════════════════════════════');
        return {
            success: true,
            deletedPatients: deletedPatientsCount,
            keptPatients: keptPatientsCount,
            deletedCounters: deletedCountersCount,
            resetRooms: roomsSnapshot.size,
            date: today,
        };
    }
    catch (error) {
        console.error('❌ Error during daily queue reset and cleanup:', error);
        throw error;
    }
});
//# sourceMappingURL=resetDailyQueue.js.map