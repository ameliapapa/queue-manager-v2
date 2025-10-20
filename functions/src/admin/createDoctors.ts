import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const users = [
  // Reception staff
  { email: 'reception@geraldine.com', password: 'Reception123!', displayName: 'Reception Staff', role: 'reception' },
  // Doctors
  { email: 'doctor1@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Alban Kurti', role: 'doctor' },
  { email: 'doctor2@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Elira Hoxha', role: 'doctor' },
  { email: 'doctor3@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Fatmir Shehu', role: 'doctor' },
  { email: 'doctor4@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Gerta Rama', role: 'doctor' },
  { email: 'doctor5@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Ilir Mema', role: 'doctor' }
];

export const createUsers = functions.https.onRequest(async (req, res) => {
  const results = [];

  for (const user of users) {
    try {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });

      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true
      });

      results.push({ success: true, email: user.email, uid: userRecord.uid, role: user.role });
    } catch (error: any) {
      results.push({ success: false, email: user.email, error: error.message });
    }
  }

  res.json({ results, credentials: users });
});
