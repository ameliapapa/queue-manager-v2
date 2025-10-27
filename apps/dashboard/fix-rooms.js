// Script to fix rooms after manual patient deletion
// Run this in the browser console on the dashboard page
//
// This fixes rooms that have references to deleted patients

async function fixRooms() {
  const { collection, getDocs, updateDoc, doc, getDoc, getFirestore } = window.firebaseModules || {};

  if (!getFirestore) {
    console.error('Firebase not loaded. Make sure you run this on the dashboard page.');
    return;
  }

  const db = getFirestore();

  console.log('🔧 Starting room cleanup...');
  console.log('');

  try {
    // Get all rooms
    const roomsRef = collection(db, 'rooms');
    const roomsSnapshot = await getDocs(roomsRef);

    let fixedCount = 0;
    let okCount = 0;

    for (const roomDoc of roomsSnapshot.docs) {
      const roomData = roomDoc.data();

      console.log(`Checking room: ${roomData.roomNumber} (${roomData.doctorName})`);

      // Check if room has a currentPatient
      if (roomData.currentPatient && roomData.currentPatient.id) {
        const patientId = roomData.currentPatient.id;

        // Check if that patient still exists
        const patientRef = doc(db, 'patients', patientId);
        const patientDoc = await getDoc(patientRef);

        if (!patientDoc.exists()) {
          console.log(`  ❌ Room has reference to deleted patient: ${patientId}`);
          console.log(`  🔧 Fixing room...`);

          // Clear the room
          await updateDoc(doc(db, 'rooms', roomDoc.id), {
            status: 'available',
            currentPatient: null,
            lastUpdated: new Date()
          });

          fixedCount++;
          console.log(`  ✅ Room fixed and set to available`);
        } else {
          console.log(`  ✅ Room is OK (patient exists)`);
          okCount++;
        }
      } else if (roomData.status === 'busy') {
        // Room is marked as busy but has no patient - this is also wrong
        console.log(`  ⚠️  Room marked as busy but has no patient`);
        console.log(`  🔧 Fixing room...`);

        await updateDoc(doc(db, 'rooms', roomDoc.id), {
          status: 'available',
          currentPatient: null,
          lastUpdated: new Date()
        });

        fixedCount++;
        console.log(`  ✅ Room fixed and set to available`);
      } else {
        console.log(`  ✅ Room is OK (available or paused)`);
        okCount++;
      }

      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ ROOM CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Rooms Fixed: ${fixedCount}`);
    console.log(`📊 Rooms OK: ${okCount}`);
    console.log(`📊 Total Rooms: ${roomsSnapshot.size}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('Now try completing consultations again!');

  } catch (error) {
    console.error('❌ Error during room cleanup:', error);
  }
}

console.log('🔧 Room Fix Script Loaded');
console.log('To fix rooms with orphaned patient references, run: fixRooms()');
