// Script to clean up old patients from Firestore
// Run with: node cleanup-old-patients.mjs

import admin from 'firebase-admin';

// Initialize Firebase Admin (using emulator)
admin.initializeApp({
  projectId: 'demo-project'
});

const db = admin.firestore();

// Connect to emulator
db.settings({
  host: 'localhost:8080',
  ssl: false
});

async function cleanupOldPatients() {
  const today = new Date().toISOString().split('T')[0];

  console.log(`🧹 Starting cleanup for patients not from ${today}`);

  try {
    // Get all patients
    const patientsRef = db.collection('patients');
    const snapshot = await patientsRef.get();

    let deletedCount = 0;
    let keptCount = 0;

    for (const patientDoc of snapshot.docs) {
      const data = patientDoc.data();
      const createdAt = data.createdAt?.toDate();
      const createdDateString = createdAt ? createdAt.toISOString().split('T')[0] : null;

      if (createdDateString !== today) {
        console.log(`🗑️  Deleting old patient: ${patientDoc.id} (created: ${createdDateString})`);
        await patientDoc.ref.delete();
        deletedCount++;
      } else {
        console.log(`✅ Keeping patient: ${patientDoc.id} (created today)`);
        keptCount++;
      }
    }

    console.log(`\n✅ Cleanup complete! Deleted: ${deletedCount}, Kept: ${keptCount}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupOldPatients();
