# Quick Start Guide

Get the Hospital Queue Management System running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier works)
- Terminal access

## Step 1: Install Dependencies (2 minutes)

```bash
# Run the automated setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install all npm dependencies
- Create `.env` files from examples
- Verify Node.js and Firebase CLI

## Step 2: Configure Firebase (2 minutes)

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name (e.g., `hospital-queue-dev`)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Get Firebase Config

1. In Firebase Console, click the gear icon > Project Settings
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register app with nickname (e.g., "Kiosk")
5. Copy the `firebaseConfig` object

### Update Configuration Files

**Update `.firebaserc`:**
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

**Update `apps/shared/firebase/config.ts`:**
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**Update all `.env` files** (kiosk, patient-registration, receptionist-dashboard, tv-display):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_USE_EMULATORS=true
```

**Update `functions/.env`:**
```env
FIREBASE_PROJECT_ID=your-project-id
REGISTRATION_BASE_URL=http://localhost:3002
HOSPITAL_NAME=City General Hospital
```

## Step 3: Enable Firestore (1 minute)

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Select "Start in **test mode**" (we'll deploy security rules later)
4. Choose a location (select closest to you)
5. Click "Enable"

## Step 4: Start Development (30 seconds)

```bash
# Terminal 1: Start Firebase Emulators
npm run emulators:start

# Terminal 2: Start Kiosk App
npm run dev:kiosk

# Terminal 3: Start Patient Registration
npm run dev:patient

# Terminal 4: Start Receptionist Dashboard
npm run dev:receptionist

# Terminal 5: Start TV Display
npm run dev:tv
```

## Step 5: Access the Apps

- **Kiosk**: http://localhost:3001
- **Patient Registration**: http://localhost:3002
- **Receptionist Dashboard**: http://localhost:3003
- **TV Display**: http://localhost:3004
- **Firebase Emulator UI**: http://localhost:4000

## Initial Setup (First Time Only)

### Initialize Firestore Data

```bash
# Make sure Firebase Emulators are running
cd scripts
FIREBASE_PROJECT_ID=your-project-id node init-firestore.js
```

This creates:
- 5 doctor rooms
- Sample receptionist user
- Today's queue counter

**Receptionist Login Credentials:**
- Email: `receptionist@hospital.com`
- Password: `Hospital123!`

## Testing the System

### 1. Generate Queue Number (Kiosk)
1. Open http://localhost:3001
2. Click "Get Queue Number"
3. Note the queue number and QR code (print won't work in dev)

### 2. Register Patient (Mobile)
1. Open http://localhost:3002?q=1 (use the queue number from step 1)
2. Fill in patient details
3. Submit form
4. See success message

### 3. Assign to Room (Receptionist)
1. Open http://localhost:3003
2. Login with credentials above
3. See the registered patient
4. Click "Assign to Room"
5. Select a room

### 4. View on TV Display
1. Open http://localhost:3004
2. See the patient in the assigned room
3. See waiting queue

## Troubleshooting

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Port already in use"
Kill the process or change ports in `vite.config.ts` files.

### "Permission denied" errors
Check Firestore security rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### "Module not found" errors
```bash
npm run install:all
```

## Next Steps

Now that you have the basic system running:

1. **Read the Documentation**
   - [Architecture](docs/ARCHITECTURE.md) - Understand the system
   - [API Reference](docs/API.md) - Learn the APIs
   - [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to production

2. **Customize**
   - Update hospital name in `apps/shared/constants.ts`
   - Modify ticket template in `functions/src/utils/pdfGenerator.ts`
   - Adjust colors in Tailwind config files

3. **Deploy to Production**
   - See [DEPLOYMENT.md](docs/DEPLOYMENT.md)
   - Set `VITE_USE_EMULATORS=false` in all `.env` files
   - Run `npm run deploy:all`

## Common Commands

```bash
# Development
npm run dev:kiosk           # Start kiosk app
npm run dev:patient         # Start patient registration
npm run dev:receptionist    # Start receptionist dashboard
npm run dev:tv              # Start TV display
npm run emulators:start     # Start Firebase emulators

# Building
npm run build:all           # Build all apps and functions
npm run build:kiosk         # Build specific app

# Deployment
npm run deploy:all          # Deploy everything
npm run deploy:functions    # Deploy only Cloud Functions
npm run deploy:firestore    # Deploy security rules
npm run deploy:hosting      # Deploy all hosting sites

# Testing
firebase emulators:start    # Start emulators with UI
npm run logs                # View Cloud Functions logs
```

## Getting Help

- **Documentation**: Check the `docs/` folder
- **Project Status**: See `PROJECT_STATUS.md`
- **Firebase Console**: Monitor usage and logs
- **GitHub Issues**: Report bugs

## Development Tips

1. **Use Emulators**: Always develop with `VITE_USE_EMULATORS=true`
2. **Real-time Logs**: Keep Firebase Emulator UI open (http://localhost:4000)
3. **Hot Reload**: Changes auto-reload in development
4. **TypeScript**: Fix type errors before deploying
5. **Security Rules**: Test rules in Emulator UI

---

**You're ready to go!** 🚀

Open the Kiosk app and start generating queue numbers.
