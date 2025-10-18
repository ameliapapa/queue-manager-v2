#!/usr/bin/env node

/**
 * Initialize Firestore with sample data
 * Run this script after deploying to set up initial rooms
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'your-project-id',
});

const db = admin.firestore();

async function initializeRooms() {
  console.log('Initializing rooms...');

  const roomsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../initial-data/rooms.json'), 'utf8')
  );

  const batch = db.batch();

  roomsData.forEach((room) => {
    const roomRef = db.collection('rooms').doc(room.id);
    batch.set(roomRef, {
      ...room,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`✅ Created ${roomsData.length} rooms`);
}

async function createSampleReceptionist() {
  console.log('Creating sample receptionist user...');

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: 'receptionist@hospital.com',
      password: 'Hospital123!',
      displayName: 'Receptionist',
    });

    console.log('✅ Created Auth user:', userRecord.uid);

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email: 'receptionist@hospital.com',
      role: 'receptionist',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log('✅ Created Firestore user document');
    console.log('');
    console.log('Receptionist credentials:');
    console.log('Email: receptionist@hospital.com');
    console.log('Password: Hospital123!');
    console.log('');
    console.log('⚠️  Please change this password in production!');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Receptionist user already exists');
    } else {
      console.error('Error creating receptionist:', error);
    }
  }
}

async function initializeQueueCounter() {
  console.log('Initializing queue counter for today...');

  const today = new Date().toISOString().split('T')[0];
  const counterRef = db.collection('queueCounter').doc(today);

  await counterRef.set({
    date: today,
    currentNumber: 0,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`✅ Created queue counter for ${today}`);
}

async function main() {
  console.log('================================================');
  console.log('Firestore Initialization');
  console.log('================================================');
  console.log('');

  try {
    await initializeRooms();
    console.log('');

    await initializeQueueCounter();
    console.log('');

    await createSampleReceptionist();
    console.log('');

    console.log('================================================');
    console.log('✅ Initialization Complete!');
    console.log('================================================');
  } catch (error) {
    console.error('❌ Error during initialization:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
