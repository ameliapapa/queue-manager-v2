# Troubleshooting Blank Screens After Deployment

## Issue
After deploying the hospital queue manager app and creating a Firestore database, all screens are showing blank.

## Common Causes and Solutions

### 1. Check Firestore Database Name

**Problem**: By default, Firebase creates a database named `(default)`, but if you created a named database, you need to specify it in your code.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `geraldina-queue-manager`
3. Navigate to **Firestore Database**
4. Check the database name at the top of the page
   - If it shows `(default)` - you're good, no changes needed
   - If it shows a custom name (e.g., `queue-manager-db`) - you need to update the code

**If you have a custom database name**, update `apps/shared/firebase/config.ts`:

```typescript
// Change this line:
const db: Firestore = getFirestore(app);

// To this (replace 'your-database-name' with your actual database name):
const db: Firestore = getFirestore(app, 'your-database-name');
```

### 2. Verify Firestore Security Rules Are Deployed

**Problem**: Security rules may not be deployed or may be blocking access.

**Solution**:
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

**Check in Firebase Console**:
1. Go to Firestore Database > Rules
2. Verify the rules match the content in `firestore.rules`
3. Make sure the rules allow read/write operations (currently set to `allow read: if true` and `allow write: if true` for development)

### 3. Check Browser Console for Errors

**Steps**:
1. Open your deployed app in a browser
2. Press F12 to open Developer Tools
3. Go to the **Console** tab
4. Look for errors related to:
   - Firebase initialization
   - Firestore connection
   - Permission denied errors
   - Network errors

**Common errors and solutions**:
- **"Missing or insufficient permissions"**: Deploy Firestore rules (see #2)
- **"Firebase: No Firebase App '[DEFAULT]' has been created"**: Firebase config is not loaded
- **"Failed to get document because the client is offline"**: Network connectivity issue or Firestore not accessible

### 4. Verify Environment Variables Are Loaded

**Problem**: Production environment variables may not be included in the build.

**Solution**:
1. Check that each app has a `.env.production` file:
   - `apps/kiosk/.env.production`
   - `apps/patient-registration/.env.production`
   - `apps/dashboard/.env.production`
   - `apps/tv-display/.env.production`

2. Each file should contain:
```env
VITE_FIREBASE_API_KEY=AIzaSyDIXiSS2N6e2mrnrQXWyhzFFjIQh7tWU30
VITE_FIREBASE_AUTH_DOMAIN=geraldina-queue-manager.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=geraldina-queue-manager
VITE_FIREBASE_STORAGE_BUCKET=geraldina-queue-manager.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=800270035531
VITE_FIREBASE_APP_ID=1:800270035531:web:3530ff27d0ba4653153bce
VITE_USE_EMULATORS=false
```

3. **Rebuild and redeploy** after adding/updating .env.production files:
```bash
# Build all apps
npm run build

# Deploy all sites
firebase deploy --only hosting
```

### 5. Check Network Tab for Failed Requests

**Steps**:
1. Open Developer Tools (F12)
2. Go to the **Network** tab
3. Refresh the page
4. Look for failed requests (red status codes)
5. Check specifically for:
   - Firestore API calls (should be to `firestore.googleapis.com`)
   - 403 Forbidden errors (permission issues)
   - 404 Not Found errors (wrong database name or collection)

### 6. Verify Firestore Database Has Collections

**Problem**: Database exists but has no collections/documents.

**Solution**:
1. Go to Firebase Console > Firestore Database
2. Check if you have these collections:
   - `patients`
   - `rooms`
   - `queueCounter`
   - `users`
   - `printJobs`

3. If collections are empty, the apps will load but show "No data" messages (not completely blank)

4. To test, manually add a test document:
   - Collection: `rooms`
   - Document ID: Auto-ID
   - Fields:
     ```json
     {
       "roomNumber": "1",
       "roomName": "Consultation Room 1",
       "status": "available",
       "createdAt": [current timestamp]
     }
     ```

### 7. Check CORS and API Restrictions

**Problem**: Firebase API may be restricted to specific domains.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `geraldina-queue-manager`
3. Go to **APIs & Services** > **Credentials**
4. Click on your API key (Browser key)
5. Check **Application restrictions**:
   - Should be set to **HTTP referrers (web sites)**
   - Add your Firebase Hosting domains:
     - `geraldina-queue-manager-kiosk.web.app/*`
     - `geraldina-queue-manager-patient.web.app/*`
     - `geraldina-queue-manager-receptionist.web.app/*`
     - `geraldina-queue-manager-tv.web.app/*`
     - `*.firebaseapp.com/*`

### 8. Test with Sample Data

Create a simple test to verify Firestore connectivity:

**Add this to your browser console on the deployed site**:
```javascript
// Check if Firebase is initialized
console.log('Firebase config:', window.firebase);

// Test Firestore read
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@shared/firebase/config';

getDocs(collection(db, 'rooms'))
  .then(snapshot => {
    console.log('Rooms found:', snapshot.size);
    snapshot.forEach(doc => console.log(doc.id, doc.data()));
  })
  .catch(error => console.error('Firestore error:', error));
```

## Quick Fix Checklist

- [ ] Firestore database is created in Firebase Console
- [ ] Database name is `(default)` or correctly specified in config
- [ ] Firestore security rules are deployed
- [ ] `.env.production` files exist and have correct values
- [ ] Apps are rebuilt with production env vars: `npm run build`
- [ ] Apps are redeployed: `firebase deploy --only hosting`
- [ ] Browser console shows no Firebase errors
- [ ] Network tab shows successful Firestore API calls
- [ ] Firestore collections exist with at least test data
- [ ] API key restrictions include your hosting domains

## Most Likely Issues

Based on your situation, the most likely causes are:

1. **Firestore rules not deployed** - Run `firebase deploy --only firestore`
2. **Named database instead of (default)** - Check database name in Firebase Console
3. **Apps built before .env.production was created** - Rebuild with `npm run build`

## Need More Help?

If screens are still blank after checking all above:

1. Share the browser console errors
2. Share the Network tab showing Firestore requests
3. Confirm the Firestore database name from Firebase Console
4. Verify collections exist in Firestore
