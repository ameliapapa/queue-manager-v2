import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const doctors = [
  { email: 'doctor1@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Alban Kurti' },
  { email: 'doctor2@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Elira Hoxha' },
  { email: 'doctor3@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Fatmir Shehu' },
  { email: 'doctor4@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Gerta Rama' },
  { email: 'doctor5@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Ilir Mema' }
];

export const createDoctorUsers = functions.https.onRequest(async (req, res) => {
  const results = [];

  for (const doctor of doctors) {
    try {
      const userRecord = await admin.auth().createUser({
        email: doctor.email,
        password: doctor.password,
        displayName: doctor.displayName,
        emailVerified: true
      });

      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'doctor' });
      
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: doctor.email,
        displayName: doctor.displayName,
        role: 'doctor',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        active: true
      });

      results.push({ success: true, email: doctor.email, uid: userRecord.uid });
    } catch (error: any) {
      results.push({ success: false, email: doctor.email, error: error.message });
    }
  }

  res.json({ results, credentials: doctors });
});
