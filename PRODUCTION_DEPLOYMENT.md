# Production Deployment Guide
## Mbretëresha Geraldinë Hospital Queue Management System

This guide outlines the steps to deploy the queue management system to production.

## Prerequisites

1. **Firebase Project Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Authentication (if using receptionist login)
   - Set up 4 Firebase Hosting sites for the 4 apps

2. **Update Firebase Configuration**
   - Update `.firebaserc` with your actual Firebase project ID
   - Update `firebase.json` hosting targets with your actual site names

## Production Configuration Steps

### 1. Update Firebase Project ID

Edit `.firebaserc`:
```json
{
  "projects": {
    "default": "YOUR_ACTUAL_PROJECT_ID"
  },
  "targets": {
    "YOUR_ACTUAL_PROJECT_ID": {
      "hosting": {
        "kiosk": ["YOUR_PROJECT_ID-kiosk"],
        "patient-registration": ["YOUR_PROJECT_ID-patient"],
        "receptionist-dashboard": ["YOUR_PROJECT_ID-receptionist"],
        "tv-display": ["YOUR_PROJECT_ID-tv"]
      }
    }
  }
}
```

### 2. Update Firebase Config in Apps

Update the Firebase configuration in `packages/shared/src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_PRODUCTION_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**IMPORTANT**: The current configuration connects to `localhost:8080` for development. Update the `connectFirestoreEmulator` line for production:

```typescript
// FOR DEVELOPMENT (current):
if (window.location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// FOR PRODUCTION: Remove or keep the if statement so it only connects to emulator in dev
```

### 3. Secure Firestore Rules

The current `firestore.rules` has open access for development. Update for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isReceptionist() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'receptionist';
    }

    // Queue counter - read-only for clients, write only from functions or receptionists
    match /queueCounter/{date} {
      allow read: if true;
      allow write: if isReceptionist(); // Or use Cloud Functions
    }

    // Patients collection
    match /patients/{patientId} {
      allow read: if true; // Public read for TV display
      allow create: if true; // Kiosk creates new patients
      allow update: if true; // Patient registration and receptionist updates
      allow delete: if isReceptionist(); // Only receptionists can delete
    }

    // Rooms collection
    match /rooms/{roomId} {
      allow read: if true; // Public read for TV display
      allow create, update, delete: if isReceptionist();
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isReceptionist(); // Only receptionists manage users
    }

    // Print jobs
    match /printJobs/{jobId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isReceptionist();
    }
  }
}
```

### 4. Set Up Room Data

Before deploying, initialize your rooms in Firestore. Create a script or manually add:

```javascript
// Collection: rooms
{
  roomNumber: 1,
  doctorName: "Dr. Name",
  status: "available",
  currentPatient: null
}
```

Repeat for all consultation rooms you want to set up.

### 5. Build All Applications

```bash
npm run build:all
```

This will build:
- apps/kiosk/dist
- apps/patient-registration/dist
- apps/receptionist-dashboard/dist
- apps/tv-display/dist

### 6. Deploy to Firebase

**Deploy Everything:**
```bash
firebase deploy
```

**Or Deploy Individually:**

```bash
# Deploy Firestore rules
firebase deploy --only firestore

# Deploy hosting (all apps)
firebase deploy --only hosting

# Deploy specific app
firebase deploy --only hosting:kiosk
firebase deploy --only hosting:patient-registration
firebase deploy --only hosting:receptionist-dashboard
firebase deploy --only hosting:tv-display
```

## Post-Deployment Setup

### 1. Printer Configuration for Kiosk

The kiosk app uses the browser's print API. Configure the browser on the kiosk machine:
- Set default printer to the thermal printer
- Configure paper size to 80mm thermal paper
- Set margins to minimal
- Enable auto-print if supported by browser

### 2. Access URLs

After deployment, your apps will be available at:
- **Kiosk**: `https://YOUR_PROJECT_ID-kiosk.web.app`
- **Patient Registration**: `https://YOUR_PROJECT_ID-patient.web.app`
- **Receptionist Dashboard**: `https://YOUR_PROJECT_ID-receptionist.web.app`
- **TV Display**: `https://YOUR_PROJECT_ID-tv.web.app`

### 3. Device Setup

**Kiosk Device:**
- Open `https://YOUR_PROJECT_ID-kiosk.web.app` in Chrome/Edge (kiosk mode)
- Connect thermal printer
- Set browser to full-screen kiosk mode

**Patient Registration Tablet:**
- Open `https://YOUR_PROJECT_ID-patient.web.app` in any modern browser
- Optionally add to home screen for app-like experience

**Reception Computer:**
- Open `https://YOUR_PROJECT_ID-receptionist.web.app`
- Bookmark for easy access

**TV Display:**
- Open `https://YOUR_PROJECT_ID-tv.web.app` in Chrome/Firefox
- Set browser to full-screen mode (F11)
- Disable screen saver/sleep on the TV/display device

## Monitoring and Maintenance

### Check Firestore Usage
Monitor your Firebase console for:
- Document reads/writes
- Storage usage
- Bandwidth

### Daily Maintenance
The queue resets daily automatically. Old patient records remain in Firestore unless deleted.

### Backup Strategy
Consider setting up automated Firestore backups through Firebase console or Cloud Functions.

## Security Checklist

- [ ] Updated Firebase configuration with production credentials
- [ ] Secured Firestore rules
- [ ] Removed or properly configured emulator connection code
- [ ] Set up Firebase Authentication for receptionist dashboard
- [ ] Configured CORS and security headers if needed
- [ ] Tested all apps in production environment
- [ ] Set up monitoring and alerts

## Troubleshooting

### Apps not connecting to Firestore
- Check browser console for errors
- Verify Firebase config is correct
- Ensure Firestore is enabled in Firebase console

### Printer not working on kiosk
- Check printer connection
- Verify printer is set as default in browser
- Test printing from browser settings

### Real-time updates not working
- Check Firestore rules allow read access
- Verify network connectivity
- Check browser console for WebSocket errors

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase console for quota/billing issues
3. Review Firestore rules and security settings

---

**Version**: 1.0.0
**Last Updated**: 2025-10-19
**Hospital**: Spitali Universitar Obstetrik Gjinekologjik - Mbretëresha Geraldinë
