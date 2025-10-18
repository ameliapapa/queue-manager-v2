/**
 * Initialize Sample Rooms in Firestore Emulator
 * Run this script to set up the 5 consultation rooms
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { connectFirestoreEmulator } = require('firebase/firestore');

// Firebase config for emulator
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: '123456789',
  appId: 'demo-app-id',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8080);

// Sample rooms data
const sampleRooms = [
  {
    id: 'room-1',
    roomNumber: '101',
    doctorName: 'Dr. Sarah Johnson',
    status: 'available',
    currentPatient: null,
  },
  {
    id: 'room-2',
    roomNumber: '102',
    doctorName: 'Dr. Michael Chen',
    status: 'available',
    currentPatient: null,
  },
  {
    id: 'room-3',
    roomNumber: '103',
    doctorName: 'Dr. Emily Rodriguez',
    status: 'available',
    currentPatient: null,
  },
  {
    id: 'room-4',
    roomNumber: '104',
    doctorName: 'Dr. James Williams',
    status: 'available',
    currentPatient: null,
  },
  {
    id: 'room-5',
    roomNumber: '105',
    doctorName: 'Dr. Lisa Anderson',
    status: 'available',
    currentPatient: null,
  },
];

async function initializeRooms() {
  console.log('🏥 Initializing rooms in Firestore emulator...\n');

  try {
    for (const room of sampleRooms) {
      const roomRef = doc(db, 'rooms', room.id);
      await setDoc(roomRef, {
        ...room,
        lastUpdated: new Date(),
        createdAt: new Date(),
      });
      console.log(`✅ Created ${room.roomNumber} - ${room.doctorName}`);
    }

    console.log('\n🎉 All rooms initialized successfully!');
    console.log('\nYou can now:');
    console.log('1. Generate queue numbers in Kiosk (http://localhost:3001)');
    console.log('2. View rooms in Dashboard (http://localhost:3003)');
    console.log('3. Assign patients to rooms');
    console.log('4. View updates on TV Display (http://localhost:3004)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing rooms:', error);
    process.exit(1);
  }
}

initializeRooms();
