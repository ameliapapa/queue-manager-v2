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
 */
exports.resetDailyQueue = functions.pubsub
    .schedule(`0 ${QUEUE_RESET_HOUR} * * *`)
    .timeZone('America/New_York') // Change to your timezone
    .onRun(async (context) => {
    const db = admin.firestore();
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log(`Starting daily queue reset for ${today}`);
        // Archive yesterday's patients by updating their status
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        // Get all patients from yesterday that are not completed
        const yesterdayPatientsSnapshot = await db
            .collection('patients')
            .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(yesterday))
            .where('createdAt', '<', admin.firestore.Timestamp.fromDate(new Date()))
            .get();
        const batch = db.batch();
        let archivedCount = 0;
        yesterdayPatientsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status !== 'completed') {
                // Mark incomplete patients as completed (or you could move them to an archive collection)
                batch.update(doc.ref, {
                    status: 'completed',
                    completedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                archivedCount++;
            }
        });
        if (archivedCount > 0) {
            await batch.commit();
            console.log(`Archived ${archivedCount} incomplete patients from ${yesterdayStr}`);
        }
        // Reset room statuses
        const roomsSnapshot = await db.collection('rooms').get();
        const roomBatch = db.batch();
        roomsSnapshot.forEach((doc) => {
            roomBatch.update(doc.ref, {
                status: 'available',
                currentPatientQueue: null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        if (!roomsSnapshot.empty) {
            await roomBatch.commit();
            console.log(`Reset ${roomsSnapshot.size} rooms to available status`);
        }
        console.log(`Daily queue reset completed successfully for ${today}`);
        return {
            success: true,
            archivedPatients: archivedCount,
            resetRooms: roomsSnapshot.size,
            date: today,
        };
    }
    catch (error) {
        console.error('Error resetting daily queue:', error);
        throw error;
    }
});
//# sourceMappingURL=resetDailyQueue.js.map