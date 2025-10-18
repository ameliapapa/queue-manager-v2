# Hospital Queue Management System - Architecture

## System Overview

The Hospital Queue Management System is a distributed real-time application built on Firebase, consisting of 4 specialized frontend applications and a serverless backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Firebase Cloud                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Firestore   │  │    Auth      │  │  Functions   │          │
│  │   Database   │  │              │  │  (Backend)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │     Kiosk      │ │  Patient   │ │ Recep.     │
    │   (Print QR)   │ │Registration│ │ Dashboard  │
    └────────────────┘ └────────────┘ └────────────┘
                              │
                       ┌──────▼──────┐
                       │ TV Display  │
                       │ (Read-only) │
                       └─────────────┘
```

## Data Flow

### 1. Queue Number Generation (Kiosk)
1. User taps "Get Queue Number" button
2. Kiosk calls Cloud Function `generateQueueNumber`
3. Function atomically increments queue counter
4. Function creates patient document with status "unregistered"
5. Function returns queue number and registration URL
6. Kiosk calls `generatePrintTicket` to get HTML ticket
7. Kiosk prints ticket with QR code using browser Print API

### 2. Patient Registration (Mobile)
1. Patient scans QR code from ticket
2. Opens Patient Registration app with queue number in URL
3. Patient fills registration form
4. App updates patient document with details
5. Status changes from "unregistered" to "registered"
6. Real-time listeners update all connected clients

### 3. Patient Assignment (Receptionist)
1. Receptionist sees all registered patients in dashboard
2. Receptionist assigns patient to available room
3. App updates patient document with room assignment
4. Status changes to "assigned"
5. Room status updates to "occupied"
6. TV Display shows patient in room queue

### 4. Queue Display (TV)
1. TV Display subscribes to real-time Firestore listeners
2. Shows waiting queue (registered but not assigned)
3. Shows each room with current patient
4. Auto-updates every 5 seconds
5. No user interaction required

## Database Schema

### Collections

#### `queueCounter` Collection
```typescript
{
  // Document ID: YYYY-MM-DD (date)
  date: string,
  currentNumber: number,
  updatedAt: Timestamp
}
```

#### `patients` Collection
```typescript
{
  // Document ID: auto-generated
  queueNumber: number,
  status: 'unregistered' | 'registered' | 'assigned' | 'completed',
  name: string | null,
  phone: string | null,
  age: number | null,
  gender: 'male' | 'female' | 'other' | null,
  notes: string | null,
  createdAt: Timestamp,
  registeredAt: Timestamp | null,
  assignedAt: Timestamp | null,
  completedAt: Timestamp | null,
  assignedRoomId: string | null,
  qrCodeUrl: string,
  printedAt: Timestamp | null
}
```

#### `rooms` Collection
```typescript
{
  // Document ID: auto-generated or room1, room2, etc.
  id: string,
  roomNumber: number,
  doctorName: string,
  status: 'available' | 'occupied' | 'paused',
  currentPatientQueue: number | null,
  updatedAt: Timestamp
}
```

#### `users` Collection (for authentication)
```typescript
{
  // Document ID: Firebase Auth UID
  email: string,
  role: 'receptionist' | 'admin',
  createdAt: Timestamp
}
```

#### `printJobs` Collection (for tracking)
```typescript
{
  // Document ID: auto-generated
  queueNumber: number,
  patientId: string,
  status: 'pending' | 'printing' | 'success' | 'failed',
  createdAt: Timestamp,
  printedAt: Timestamp | null,
  error: string | null
}
```

## Security Model

### Firestore Security Rules

1. **Queue Counter**: Read-only for clients, write-only for Cloud Functions
2. **Patients**:
   - Read: Public (for TV display)
   - Create: Cloud Functions only
   - Update: Patients can self-register, Receptionists can modify any
3. **Rooms**: Read public, write requires receptionist authentication
4. **Users**: Users can read their own data only
5. **Print Jobs**: Read public, write Cloud Functions only

### Authentication

- **Receptionist Dashboard**: Requires Firebase Auth email/password login
- **Other Apps**: No authentication required (but protected by security rules)

## Real-time Updates

All apps use Firestore real-time listeners (`onSnapshot`) for live updates:

- **Kiosk**: Monitors print job status
- **Patient Registration**: No real-time needed (one-time form submission)
- **Receptionist Dashboard**: Monitors all patients and rooms
- **TV Display**: Monitors assigned patients and rooms

## Scalability Considerations

### Current Scale (~100 patients/day)
- Firestore reads: ~50,000/day (within free tier)
- Firestore writes: ~500/day (well within limits)
- Cloud Functions: ~200 invocations/day
- Hosting bandwidth: Minimal

### Future Scaling
- Add indexes for complex queries
- Implement pagination for patient lists
- Use Firestore bundles for initial data load
- Add caching layer for frequently accessed data
- Consider moving to Cloud Run for heavy operations

## Offline Support

### Kiosk
- Uses Firestore offline persistence
- Queues operations when offline
- Prints from cached data if available

### Patient Registration
- Shows error message if offline
- Prevents form submission without connection

### Receptionist Dashboard
- Firestore offline persistence enabled
- Shows stale data with warning banner

### TV Display
- Firestore offline persistence enabled
- Last known state displayed if disconnected

## Error Handling

### Network Errors
- Retry mechanism with exponential backoff
- User-friendly error messages
- Offline indicators

### Print Errors
- Print job tracking in Firestore
- Manual retry capability
- Fallback to showing QR code on screen

### Validation Errors
- Client-side validation before submission
- Server-side validation in security rules
- Clear error messages to users

## Performance Optimization

1. **Code Splitting**: Each app is independently bundled
2. **Lazy Loading**: Components loaded on demand
3. **Image Optimization**: QR codes generated at optimal size
4. **Query Optimization**: Indexed queries for fast retrieval
5. **Caching**: Browser caching for static assets

## Monitoring & Logging

- Firebase Analytics for user behavior
- Cloud Functions logs for backend errors
- Firestore usage monitoring
- Custom error tracking for print failures

## Backup & Recovery

- Firestore automatic backups
- Export patient data daily
- Point-in-time recovery available
- Version control for all code
