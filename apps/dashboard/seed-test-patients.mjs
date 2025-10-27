// Script to seed test patients with various dates for testing cleanup
// Run with: node seed-test-patients.mjs

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

async function seedTestPatients() {
  console.log('🌱 Seeding test patients...\n');

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const testPatients = [
    // Today's patients (should be kept)
    {
      name: 'John Doe',
      queueNumber: 1,
      status: 'waiting',
      department: 'General',
      createdAt: admin.firestore.Timestamp.fromDate(today)
    },
    {
      name: 'Jane Smith',
      queueNumber: 2,
      status: 'consulting',
      department: 'Pediatrics',
      createdAt: admin.firestore.Timestamp.fromDate(today)
    },
    {
      name: 'Bob Johnson',
      queueNumber: 3,
      status: 'waiting',
      department: 'General',
      createdAt: admin.firestore.Timestamp.fromDate(today)
    },

    // Yesterday's patients (should be deleted)
    {
      name: 'Alice Brown',
      queueNumber: 5,
      status: 'completed',
      department: 'General',
      createdAt: admin.firestore.Timestamp.fromDate(yesterday)
    },
    {
      name: 'Charlie Davis',
      queueNumber: 8,
      status: 'waiting',
      department: 'Cardiology',
      createdAt: admin.firestore.Timestamp.fromDate(yesterday)
    },

    // Two days ago (should be deleted)
    {
      name: 'Eve Wilson',
      queueNumber: 12,
      status: 'completed',
      department: 'General',
      createdAt: admin.firestore.Timestamp.fromDate(twoDaysAgo)
    },

    // Last week (should be deleted)
    {
      name: 'Frank Miller',
      queueNumber: 3,
      status: 'completed',
      department: 'Pediatrics',
      createdAt: admin.firestore.Timestamp.fromDate(lastWeek)
    }
  ];

  try {
    const patientsRef = db.collection('patients');

    for (const patient of testPatients) {
      const docRef = await patientsRef.add(patient);
      const dateStr = patient.createdAt.toDate().toISOString().split('T')[0];
      console.log(`✅ Added patient: ${patient.name} (${dateStr}) - ID: ${docRef.id}`);
    }

    console.log('\n📊 Summary:');
    console.log(`   Today: 3 patients (should be KEPT)`);
    console.log(`   Yesterday: 2 patients (should be DELETED)`);
    console.log(`   2 days ago: 1 patient (should be DELETED)`);
    console.log(`   Last week: 1 patient (should be DELETED)`);
    console.log(`   Total: ${testPatients.length} patients added`);
    console.log('\n🧹 Now run: node cleanup-old-patients.mjs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding patients:', error);
    process.exit(1);
  }
}

seedTestPatients();
