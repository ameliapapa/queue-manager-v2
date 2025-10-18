import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const QUEUE_RESET_HOUR = parseInt(process.env.QUEUE_RESET_HOUR || '0', 10);

/**
 * Scheduled Cloud Function to reset the queue counter daily at midnight
 * This runs automatically every day at the specified hour (default: midnight)
 */
export const resetDailyQueue = functions.pubsub
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
    } catch (error: any) {
      console.error('Error resetting daily queue:', error);
      throw error;
    }
  });
