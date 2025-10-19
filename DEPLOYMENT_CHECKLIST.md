# Deployment Checklist for Production
## Geraldina Queue Manager

Use this checklist to ensure all steps are completed before deploying to production.

## Pre-Deployment Setup

### 1. Firebase Console Setup
- [ ] Firebase project created: `geraldina-queue-manager`
- [ ] Firestore Database enabled
- [ ] Firebase Authentication enabled (if using receptionist login)
- [ ] Created 4 Firebase Hosting sites:
  - [ ] `geraldina-queue-manager-kiosk`
  - [ ] `geraldina-queue-manager-patient`
  - [ ] `geraldina-queue-manager-receptionist`
  - [ ] `geraldina-queue-manager-tv`

### 2. Get Firebase Credentials
From Firebase Console → Project Settings → General:
- [ ] Copy API Key
- [ ] Copy Auth Domain
- [ ] Confirm Project ID: `geraldina-queue-manager`
- [ ] Copy Storage Bucket
- [ ] Copy Messaging Sender ID
- [ ] Copy App ID

### 3. Configure Environment Variables
For EACH app, create `.env.production` file:

**apps/kiosk/.env.production**
**apps/patient-registration/.env.production**
**apps/dashboard/.env.production**
**apps/tv-display/.env.production**

```bash
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=geraldina-queue-manager.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=geraldina-queue-manager
VITE_FIREBASE_STORAGE_BUCKET=geraldina-queue-manager.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USE_EMULATORS=false
```

### 4. Update Firestore Security Rules
- [ ] Review `firestore.rules` file
- [ ] Update rules for production security (see PRODUCTION_DEPLOYMENT.md)
- [ ] Test rules in Firebase Console

### 5. Initialize Room Data
In Firestore, create initial rooms:
- [ ] Collection: `rooms`
- [ ] Add documents for each consultation room
```javascript
{
  roomNumber: 1,
  doctorName: "Dr. [Name]",
  status: "available",
  currentPatient: null
}
```

## Build and Deploy

### 6. Build Applications
```bash
# Build all apps
npm run build:all
```
- [ ] Kiosk build successful
- [ ] Patient registration build successful
- [ ] Dashboard build successful
- [ ] TV display build successful

### 7. Deploy to Firebase
```bash
# Deploy firestore rules first
firebase deploy --only firestore:rules

# Deploy all hosting sites
firebase deploy --only hosting
```

- [ ] Firestore rules deployed
- [ ] Kiosk deployed
- [ ] Patient registration deployed
- [ ] Dashboard deployed
- [ ] TV display deployed

## Post-Deployment Verification

### 8. Test Each App
- [ ] **Kiosk**: https://geraldina-queue-manager-kiosk.web.app
  - [ ] Can generate queue numbers
  - [ ] Printout displays correctly
  - [ ] Albanian text displays properly
  - [ ] Maroon branding applied

- [ ] **Patient Registration**: https://geraldina-queue-manager-patient.web.app
  - [ ] Can register patients
  - [ ] Form validation works
  - [ ] Albanian text displays properly
  - [ ] Maroon branding applied

- [ ] **Dashboard**: https://geraldina-queue-manager-receptionist.web.app
  - [ ] Can see all patients
  - [ ] Can assign patients to rooms
  - [ ] Can complete consultations
  - [ ] Real-time updates work
  - [ ] Albanian text displays properly
  - [ ] Maroon branding applied

- [ ] **TV Display**: https://geraldina-queue-manager-tv.web.app
  - [ ] Shows room status
  - [ ] Shows registered patients (queue numbers only)
  - [ ] Shows unregistered queue (queue numbers only)
  - [ ] Real-time updates work
  - [ ] Albanian text displays properly
  - [ ] Color coding correct (maroon header, green registered, orange unregistered)

### 9. Test Real-Time Connectivity
- [ ] Generate queue number on kiosk → appears on TV display
- [ ] Register patient → moves from unregistered to registered on TV
- [ ] Assign patient on dashboard → shows in room on TV display
- [ ] Complete consultation → patient removed from display

### 10. Device Configuration

**Kiosk Device:**
- [ ] Browser set to full-screen/kiosk mode
- [ ] Thermal printer connected and configured
- [ ] Printer set as default in browser
- [ ] Auto-print configured (if supported)
- [ ] Screen saver disabled

**Patient Registration Tablet:**
- [ ] Added to home screen for app-like experience
- [ ] Auto-lock disabled or set to long timeout
- [ ] Bookmark created for easy access

**Reception Computer:**
- [ ] Bookmarked dashboard URL
- [ ] Login credentials configured (if using auth)
- [ ] Tested from actual reception desk

**TV Display:**
- [ ] Browser in full-screen mode (F11)
- [ ] Auto-refresh disabled
- [ ] Screen saver disabled on display device
- [ ] HDMI/display connection stable

## Security & Monitoring

### 11. Security Review
- [ ] Firestore rules properly restrict write access
- [ ] No sensitive data exposed in client code
- [ ] HTTPS enforced on all sites
- [ ] Firebase quotas reviewed

### 12. Set Up Monitoring
- [ ] Firebase Console notifications enabled
- [ ] Usage alerts configured
- [ ] Billing alerts set (if applicable)

## Go Live

### 13. Final Checks
- [ ] All devices on hospital network
- [ ] Hospital staff trained on system usage
- [ ] Emergency contact information provided
- [ ] Backup plan documented

### 14. Launch
- [ ] System activated
- [ ] First test patient processed successfully
- [ ] Staff confirmed system is working
- [ ] Monitor for first hour of operation

## Post-Launch

### 15. Day 1 Monitoring
- [ ] Check all devices after 1 hour
- [ ] Review Firebase console for errors
- [ ] Gather staff feedback
- [ ] Address any immediate issues

---

**Notes:**
- Keep this checklist for future updates
- Document any issues encountered during deployment
- Update checklist based on lessons learned

**Support Contact:**
- Firebase Console: https://console.firebase.google.com
- Project: geraldina-queue-manager
