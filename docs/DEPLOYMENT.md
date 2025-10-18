# Deployment Guide

## Prerequisites

1. **Node.js 18+** and npm installed
2. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Firebase Project** created at https://console.firebase.google.com

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd hospital-queue-manager

# Install all dependencies
npm run install:all
```

### 2. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# List your projects
firebase projects:list

# Set your project
firebase use <your-project-id>
```

Update `.firebaserc` with your project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3. Configure Environment Variables

Create `.env` files in each app directory based on `.env.example`:

**apps/kiosk/.env**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_REGISTRATION_URL=https://your-project-id-patient.web.app
VITE_USE_EMULATORS=false
```

Repeat for all other apps (patient-registration, receptionist-dashboard, tv-display).

**functions/.env**
```env
FIREBASE_PROJECT_ID=your-project-id
REGISTRATION_BASE_URL=https://your-project-id-patient.web.app
HOSPITAL_NAME=City General Hospital
QUEUE_RESET_HOUR=0
QUEUE_START_NUMBER=1
MAX_QUEUE_NUMBER=999
QR_CODE_SIZE=200
TICKET_WIDTH_MM=80
TICKET_HEIGHT_MM=120
```

### 4. Firebase Configuration

Get your Firebase config from Firebase Console:
1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Add app" > Web
4. Copy the configuration

Update `apps/shared/firebase/config.ts` with your Firebase config.

### 5. Set Up Hosting Sites

Create hosting sites for each app:

```bash
# Create sites
firebase hosting:sites:create your-project-id-kiosk
firebase hosting:sites:create your-project-id-patient
firebase hosting:sites:create your-project-id-receptionist
firebase hosting:sites:create your-project-id-tv

# Link sites to targets
firebase target:apply hosting kiosk your-project-id-kiosk
firebase target:apply hosting patient-registration your-project-id-patient
firebase target:apply hosting receptionist-dashboard your-project-id-receptionist
firebase target:apply hosting tv-display your-project-id-tv
```

Update `.firebaserc` with the sites:
```json
{
  "projects": {
    "default": "your-project-id"
  },
  "targets": {
    "your-project-id": {
      "hosting": {
        "kiosk": ["your-project-id-kiosk"],
        "patient-registration": ["your-project-id-patient"],
        "receptionist-dashboard": ["your-project-id-receptionist"],
        "tv-display": ["your-project-id-tv"]
      }
    }
  }
}
```

## Development

### Local Development with Emulators

```bash
# Terminal 1: Start Firebase Emulators
npm run emulators:start

# Terminal 2: Start Kiosk app
npm run dev:kiosk

# Terminal 3: Start Patient Registration app
npm run dev:patient

# Terminal 4: Start Receptionist Dashboard
npm run dev:receptionist

# Terminal 5: Start TV Display
npm run dev:tv
```

Access the apps:
- Kiosk: http://localhost:3001
- Patient Registration: http://localhost:3002
- Receptionist Dashboard: http://localhost:3003
- TV Display: http://localhost:3004
- Firebase Emulator UI: http://localhost:4000

### Using Emulators

Set `VITE_USE_EMULATORS=true` in all app `.env` files to use local emulators.

## Building for Production

```bash
# Build all apps and functions
npm run build:all

# Or build individually
npm run build:kiosk
npm run build:patient
npm run build:receptionist
npm run build:tv
npm run build:functions
```

## Deployment

### Full Deployment

Deploy everything (Firestore, Functions, Hosting):

```bash
npm run deploy:all
```

### Partial Deployment

Deploy specific components:

```bash
# Deploy only Cloud Functions
npm run deploy:functions

# Deploy only Firestore rules and indexes
npm run deploy:firestore

# Deploy only Hosting (all apps)
npm run deploy:hosting
```

### Individual App Deployment

```bash
# Deploy specific hosting site
firebase deploy --only hosting:kiosk
firebase deploy --only hosting:patient-registration
firebase deploy --only hosting:receptionist-dashboard
firebase deploy --only hosting:tv-display
```

## Post-Deployment Configuration

### 1. Create Initial Room Documents

Use Firebase Console to create room documents in the `rooms` collection:

```javascript
// Room 1
{
  roomNumber: 1,
  doctorName: "Dr. Smith",
  status: "available",
  currentPatientQueue: null,
  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
}

// Repeat for rooms 2-5
```

Or use Firebase CLI:

```bash
# Run this script to initialize rooms
firebase firestore:import --collection rooms ./initial-data/rooms.json
```

### 2. Create Receptionist Users

Create users in Firebase Console > Authentication:

1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. Note the UID

Then create user document in Firestore `users` collection:

```javascript
{
  email: "receptionist@hospital.com",
  role: "receptionist",
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}
```

### 3. Configure Custom Domain (Optional)

```bash
# Add custom domain in Firebase Console
firebase hosting:channel:deploy production --only kiosk
```

## Verification

After deployment, verify:

1. **Kiosk App**: Can generate queue numbers
2. **Patient Registration**: Can submit registration form
3. **Receptionist Dashboard**: Can login and assign patients
4. **TV Display**: Shows real-time queue updates
5. **Cloud Functions**: Check logs in Firebase Console

## Monitoring

### Check Logs

```bash
# Cloud Functions logs
npm run logs

# Or view in Firebase Console
# Functions > Logs
```

### Monitor Usage

Check Firebase Console:
- Firestore usage: Database > Usage
- Functions usage: Functions > Usage
- Hosting bandwidth: Hosting > Usage

## Troubleshooting

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules functions/node_modules
npm run install:all
```

### Deployment Errors

```bash
# Check Firebase CLI version
firebase --version

# Update Firebase CLI
npm install -g firebase-tools@latest

# Check project permissions
firebase projects:list
```

### CORS Issues

If you encounter CORS issues, add domains to Firebase Authentication:
- Go to Authentication > Settings > Authorized domains
- Add your hosting URLs

### Print Issues

See [PRINTER_SETUP.md](PRINTER_SETUP.md) for printer configuration.

## Rollback

If deployment fails, rollback to previous version:

```bash
# View deployment history
firebase hosting:clone

# Rollback specific site
firebase hosting:rollback <site-id>
```

## CI/CD Setup (Optional)

Example GitHub Actions workflow:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm run install:all
      - run: npm run build:all
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Security Checklist

- [ ] Firebase security rules deployed
- [ ] Environment variables configured
- [ ] Receptionist authentication enabled
- [ ] HTTPS enforced for all apps
- [ ] API keys restricted in Firebase Console
- [ ] Firestore indexes created
- [ ] Cloud Functions timeout configured
- [ ] Regular backups scheduled

## Backup Strategy

1. **Daily Firestore Exports**:
   ```bash
   gcloud firestore export gs://your-backup-bucket
   ```

2. **Code Repository**: Use Git for version control

3. **Configuration Backup**: Store `.env` files securely (not in Git)

## Performance Optimization

1. Enable Firestore persistence in all apps
2. Use CDN for static assets
3. Implement code splitting
4. Monitor bundle sizes
5. Use production builds only

## Cost Estimation

For ~100 patients/day:
- Firestore: Free tier (50K reads, 20K writes)
- Cloud Functions: Free tier (2M invocations)
- Hosting: Free tier (10GB/month)
- **Estimated Cost**: $0/month (within free tier)

For higher volumes, monitor Firebase Console usage metrics.
