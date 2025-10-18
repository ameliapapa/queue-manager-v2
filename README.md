# Hospital Queue Management System

A comprehensive real-time queue management system for hospitals, built with React, TypeScript, and Firebase.

## Overview

This system handles ~100 patients/day across 5 doctor rooms with:
- **Kiosk**: Self-service queue number generation with thermal printer support
- **Patient Registration**: Mobile-first form for patient details via QR code
- **Receptionist Dashboard**: Patient assignment and queue management
- **TV Display**: Real-time queue status for waiting room

## Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Firebase (Firestore + Cloud Functions + Auth + Hosting)
- **Styling**: Tailwind CSS
- **State Management**: React Context + Firebase real-time listeners
- **QR Generation**: qrcode library
- **Printing**: Browser Print API + Firebase Cloud Functions for PDF generation

## Project Structure

```
hospital-queue-manager/
├── apps/
│   ├── shared/                    # Shared types, hooks, and utilities
│   ├── kiosk/                     # Queue number generation kiosk
│   ├── patient-registration/      # Patient mobile registration
│   ├── receptionist-dashboard/    # Queue management dashboard
│   └── tv-display/                # Waiting room display
├── functions/                     # Firebase Cloud Functions
├── design/                        # Design assets and templates
└── docs/                          # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project

### Installation

1. Clone the repository
2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure Firebase:
   - Update `.firebaserc` with your Firebase project ID
   - Update `apps/shared/firebase/config.ts` with your Firebase config

4. Start development servers:
   ```bash
   # Start all apps (in separate terminals)
   npm run dev:kiosk
   npm run dev:patient
   npm run dev:receptionist
   npm run dev:tv

   # Start Firebase emulators
   npm run emulators:start
   ```

### Building for Production

```bash
# Build all apps
npm run build:all

# Build specific app
npm run build:kiosk
npm run build:patient
npm run build:receptionist
npm run build:tv
npm run build:functions
```

### Deployment

```bash
# Deploy everything
npm run deploy:all

# Deploy specific services
npm run deploy:functions
npm run deploy:firestore
npm run deploy:hosting
```

## Features

### Kiosk App
- One-tap queue number generation
- Automatic thermal/standard printer support
- QR code ticket printing
- Offline-capable with graceful degradation

### Patient Registration
- QR code scanning
- Mobile-optimized registration form
- Real-time validation
- Duplicate registration prevention

### Receptionist Dashboard
- Real-time queue monitoring
- Patient assignment to doctors
- Room status management
- Search and filtering

### TV Display
- Auto-updating queue display
- Room-wise patient lists
- Clean, large-text interface
- No interaction required

## Security

- Firestore security rules prevent unauthorized access
- Only authenticated receptionists can modify queue
- Patient registration uses one-time QR codes
- Cloud Functions handle sensitive operations

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation

See the `docs/` folder for:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [PRINTER_SETUP.md](docs/PRINTER_SETUP.md) - Printer configuration
- [API.md](docs/API.md) - API reference

## License

MIT
