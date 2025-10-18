# Firebase Local Setup Guide

This guide explains how to run the Queue Manager system with Firebase Emulators for local development and testing.

## Prerequisites

### Java Installation (Required for Firestore Emulator)

The Firestore emulator requires Java 11 or higher. Check your version:

```bash
java -version
```

If you have Java 8 or need to install Java:

**macOS:**
```bash
brew install openjdk@21
sudo ln -sfn /usr/local/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
export JAVA_HOME=/usr/local/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install openjdk-21-jdk
```

**Windows:**
Download from [AdoptOpenJDK](https://adoptopenjdk.net/) or use Chocolatey:
```bash
choco install openjdk21
```

### Firebase CLI

Already installed globally:
```bash
firebase --version  # Should show 14.20.0 or higher
```

## Current Setup

The project is already configured with:

✅ `firebase.json` - Emulator configuration
✅ `firestore.rules` - Security rules
✅ `firestore.indexes.json` - Database indexes
✅ `.env` files for each app - Configured to use emulators

## Emulator Ports

- **Firestore**: http://localhost:8080
- **Authentication**: http://localhost:9099
- **Emulator UI**: http://localhost:4000
- **Functions** (optional): http://localhost:5001

## Starting the Emulators

### Option 1: Firestore + Auth (Recommended for Testing)

```bash
cd /Users/test/workspace/queue-manager-v2
firebase emulators:start --only firestore,auth
```

### Option 2: All Emulators (Including UI)

```bash
firebase emulators:start
```

### Option 3: With Emulator UI on Different Port

```bash
firebase emulators:start --only firestore,auth --ui-port=4001
```

## Environment Configuration

All apps are configured to use emulators via `.env` files:

```env
VITE_USE_EMULATORS=true
VITE_FIREBASE_PROJECT_ID=demo-project
```

The shared Firebase config ([apps/shared/firebase/config.ts](apps/shared/firebase/config.ts)) automatically connects to emulators when `VITE_USE_EMULATORS=true`.

## Running the Complete System Locally

### Terminal 1: Start Firebase Emulators
```bash
firebase emulators:start --only firestore,auth
```

Wait for:
```
✔  All emulators ready! It is now safe to connect your app.
```

### Terminal 2: Start WebSocket Server
```bash
cd apps/websocket-server
npm run dev
```

### Terminal 3: Start Kiosk
```bash
cd apps/kiosk
npm run dev
```

### Terminal 4: Start Patient Registration
```bash
cd apps/patient-registration
npm run dev
```

### Terminal 5: Start Dashboard
```bash
cd apps/dashboard
npm run dev
```

### Terminal 6: Start TV Display
```bash
cd apps/tv-display
npm run dev
```

## Accessing the Apps

Once all services are running:

- **Kiosk**: http://localhost:3001
- **Patient Registration**: http://localhost:3002
- **Dashboard**: http://localhost:3003
- **TV Display**: http://localhost:3004
- **WebSocket Server**: ws://localhost:3005
- **Firebase Emulator UI**: http://localhost:4000

## Testing the Complete Workflow

1. **Generate Queue Number** (Kiosk)
   - Visit http://localhost:3001
   - Click "Get Queue Number"
   - Print ticket with QR code

2. **Register Patient** (Mobile)
   - Scan QR code or visit http://localhost:3002?queue=1&patient=abc123
   - Fill in patient details
   - Submit registration

3. **Manage Queue** (Dashboard)
   - Visit http://localhost:3003
   - See registered patients
   - Call patient to doctor room
   - Mark consultation as complete

4. **View Queue Status** (TV Display)
   - Visit http://localhost:3004
   - See real-time updates across all three columns:
     - Room Status (patients in consultation)
     - Registered Patients (waiting to be called)
     - Unregistered Queue (pending registration)

## Viewing Firebase Data

The Emulator UI provides a visual interface to inspect data:

1. Open http://localhost:4000
2. Navigate to **Firestore** tab
3. Browse collections:
   - `patients` - All patient records
   - `queue` - Queue metadata

## Seeding Test Data

You can manually add test data through the Emulator UI or create a seed script.

### Option 1: Via Emulator UI
1. Open http://localhost:4000
2. Click on Firestore
3. Click "Start Collection"
4. Add documents manually

### Option 2: Via Code (Create seed script)
Create `scripts/seed-data.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Initialize Firebase with emulator
const app = initializeApp({ projectId: 'demo-project' });
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8080);

async function seedData() {
  // Add test patients
  await addDoc(collection(db, 'patients'), {
    queueNumber: 1,
    status: 'pending',
    createdAt: new Date(),
  });

  console.log('✅ Seed data added');
}

seedData();
```

## Exporting/Importing Data

### Export Data
```bash
firebase emulators:export ./emulator-data
```

### Import Data on Start
```bash
firebase emulators:start --import=./emulator-data
```

### Auto-export on Exit
```bash
firebase emulators:start --import=./emulator-data --export-on-exit
```

## Troubleshooting

### Java Version Error
```
Error: java.lang.UnsupportedClassVersionError
```
**Solution**: Install Java 11+ (see Prerequisites above)

### Port Already in Use
```
Error: Port 8080 is not available
```
**Solution**: Change ports in `firebase.json` or kill the process using the port:
```bash
lsof -ti:8080 | xargs kill -9
```

### Emulator Connection Failed
**Check**:
1. Emulators are running (`firebase emulators:start`)
2. `.env` has `VITE_USE_EMULATORS=true`
3. Browser console for connection errors

### Data Not Persisting
Emulator data is cleared on restart unless exported. Use `--export-on-exit` flag.

## Security Rules

The `firestore.rules` file defines security:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads/writes in development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Production Warning**: Update rules before deploying to production!

## Next Steps

1. ✅ Install Java 21
2. ✅ Start Firebase Emulators
3. ✅ Start all apps
4. ✅ Test complete workflow
5. ✅ Export sample data for future use

## Alternative: Using Demo Project (No Emulators)

If Java installation is problematic, you can use Firebase's demo project mode which doesn't require emulators:

Update `.env` files:
```env
VITE_USE_EMULATORS=false
VITE_FIREBASE_PROJECT_ID=demo-project-id
```

**Note**: This uses in-memory storage and won't persist data.

## Production Deployment

When ready to deploy:

1. Create real Firebase project
2. Update `.env` files with production credentials
3. Set `VITE_USE_EMULATORS=false`
4. Update `firestore.rules` with proper security
5. Deploy:
   ```bash
   npm run build  # Build all apps
   firebase deploy
   ```
