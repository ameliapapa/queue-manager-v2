// Script to fix rooms after manual patient deletion
// Run this in the browser console on the dashboard page
//
// This version directly accesses the Firebase config and recreates the connection

async function fixRooms() {
  console.log('🔧 Starting room cleanup...');
  console.log('');

  try {
    // Use the Firebase SDK that's already loaded in the browser
    const { initializeApp, getApps } = window.firebase || {};
    const { getFirestore, collection, getDocs, doc, getDoc, updateDoc } = window.firebaseFirestore || {};

    if (!getFirestore) {
      console.error('❌ Firebase Firestore not available.');
      console.error('');
      console.error('Alternative: Use Firebase Console instead:');
      console.error('1. Go to: https://console.firebase.google.com/project/geraldina-queue-manager/firestore');
      console.error('2. Click on "rooms" collection');
      console.error('3. For each room document:');
      console.error('   - If status is "busy" but should be available, click it');
      console.error('   - Edit the document:');
      console.error('     • Change status to "available"');
      console.error('     • Delete the currentPatient field');
      console.error('     • Save');
      return;
    }

    // Firebase config (from your dashboard app)
    const firebaseConfig = {
      apiKey: 'AIzaSyDIXiSS2N6e2mrnrQXWyhzFFjIQh7tWU30',
      authDomain: 'geraldina-queue-manager.firebaseapp.com',
      projectId: 'geraldina-queue-manager',
      storageBucket: 'geraldina-queue-manager.firebasestorage.app',
      messagingSenderId: '800270035531',
      appId: '1:800270035531:web:3530ff27d0ba4653153bce',
    };

    // Initialize or get existing app
    let app;
    const existingApps = getApps();
    if (existingApps && existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Using existing Firebase app');
    } else {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized');
    }

    const db = getFirestore(app);

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
          const roomRef = doc(db, 'rooms', roomDoc.id);
          await updateDoc(roomRef, {
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

        const roomRef = doc(db, 'rooms', roomDoc.id);
        await updateDoc(roomRef, {
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
    console.log('✅ All done! Try completing consultations now.');

  } catch (error) {
    console.error('❌ Error during room cleanup:', error);
    console.error('');
    console.error('If this continues to fail, fix manually via Firebase Console:');
    console.error('https://console.firebase.google.com/project/geraldina-queue-manager/firestore');
  }
}

console.log('🔧 Room Fix Script v2 Loaded');
console.log('To fix rooms with orphaned patient references, run: fixRooms()');
