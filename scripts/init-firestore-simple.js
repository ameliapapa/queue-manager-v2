#!/usr/bin/env node

/**
 * Simple Firestore initialization using firebase client SDK
 * This works without needing service account credentials
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDIXiSS2N6e2mrnrQXWyhzFFjIQh7tWU30',
  authDomain: 'geraldina-queue-manager.firebaseapp.com',
  projectId: 'geraldina-queue-manager',
  storageBucket: 'geraldina-queue-manager.firebasestorage.app',
  messagingSenderId: '800270035531',
  appId: '1:800270035531:web:3530ff27d0ba4653153bce',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function initializeRooms() {
  console.log('Initializing rooms...');

  const roomsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../initial-data/rooms.json'), 'utf8')
  );

  for (const room of roomsData) {
    await setDoc(doc(db, 'rooms', room.id), {
      ...room,
      updatedAt: serverTimestamp(),
    });
  }

  console.log(`✅ Created ${roomsData.length} rooms`);
}

async function initializeQueueCounter() {
  console.log('Initializing queue counter for today...');

  const today = new Date().toISOString().split('T')[0];

  await setDoc(doc(db, 'queueCounter', today), {
    date: today,
    counter: 0,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Created queue counter for ${today}`);
}

async function main() {
  console.log('================================================');
  console.log('Firestore Initialization (Simple)');
  console.log('================================================');
  console.log('');
  console.log('⚠️  Note: This script creates rooms and queue counter.');
  console.log('    For user creation, please use Firebase Console.');
  console.log('');

  try {
    await initializeRooms();
    console.log('');

    await initializeQueueCounter();
    console.log('');

    console.log('================================================');
    console.log('✅ Initialization Complete!');
    console.log('================================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to Firebase Console > Authentication');
    console.log('2. Create a user with email: receptionist@hospital.com');
    console.log('3. Go to Firestore Database > users collection');
    console.log('4. Create a document with the user UID and fields:');
    console.log('   - email: receptionist@hospital.com');
    console.log('   - role: receptionist');
    console.log('   - createdAt: [timestamp]');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
