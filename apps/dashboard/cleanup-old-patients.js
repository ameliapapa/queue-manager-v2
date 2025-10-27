// Quick script to clean up old patients and queue counters from Firestore
// Run this in the browser console on the dashboard page
//
// This script is FUTURE-PROOF:
// - Automatically deletes patients from ALL previous days
// - Keeps ONLY today's patients (based on when the script runs)
// - Also cleans up old queue counter documents
// - Safe to run any day - will always keep today's data

async function cleanupOldPatients() {
  const { collection, getDocs, deleteDoc, doc, getFirestore } = window.firebaseModules || {};

  if (!getFirestore) {
    console.error('Firebase not loaded. Make sure you run this on the dashboard page.');
    return;
  }

  const db = getFirestore();
  const today = new Date().toISOString().split('T')[0];

  console.log(`🧹 Starting cleanup for data not from ${today}`);
  console.log(`📅 Today's date: ${today}`);
  console.log('');

  try {
    // Step 1: Clean up old patients
    console.log('Step 1: Cleaning up old patients...');
    const patientsRef = collection(db, 'patients');
    const patientsSnapshot = await getDocs(patientsRef);

    let deletedPatientsCount = 0;
    let keptPatientsCount = 0;

    for (const patientDoc of patientsSnapshot.docs) {
      const data = patientDoc.data();
      const createdAt = data.createdAt?.toDate();
      const createdDateString = createdAt ? createdAt.toISOString().split('T')[0] : null;

      if (createdDateString !== today) {
        console.log(`  🗑️  Deleting old patient: ${patientDoc.id} (created: ${createdDateString || 'unknown'})`);
        await deleteDoc(doc(db, 'patients', patientDoc.id));
        deletedPatientsCount++;
      } else {
        keptPatientsCount++;
      }
    }

    console.log(`  ✅ Patients cleanup: Deleted ${deletedPatientsCount}, Kept ${keptPatientsCount}`);
    console.log('');

    // Step 2: Clean up old queue counters
    console.log('Step 2: Cleaning up old queue counters...');
    const countersRef = collection(db, 'queueCounter');
    const countersSnapshot = await getDocs(countersRef);

    let deletedCountersCount = 0;
    let keptCountersCount = 0;

    for (const counterDoc of countersSnapshot.docs) {
      const counterDate = counterDoc.id; // Document ID is the date (YYYY-MM-DD)

      if (counterDate !== today) {
        console.log(`  🗑️  Deleting old queue counter: ${counterDate}`);
        await deleteDoc(doc(db, 'queueCounter', counterDoc.id));
        deletedCountersCount++;
      } else {
        keptCountersCount++;
      }
    }

    console.log(`  ✅ Counters cleanup: Deleted ${deletedCountersCount}, Kept ${keptCountersCount}`);
    console.log('');

    // Final summary
    console.log('═══════════════════════════════════════');
    console.log('✅ CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Patients Deleted: ${deletedPatientsCount}`);
    console.log(`📊 Total Patients Kept: ${keptPatientsCount}`);
    console.log(`📊 Total Queue Counters Deleted: ${deletedCountersCount}`);
    console.log(`📊 Total Queue Counters Kept: ${keptCountersCount}`);
    console.log('═══════════════════════════════════════');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

console.log('To clean up old patients, run: cleanupOldPatients()');
