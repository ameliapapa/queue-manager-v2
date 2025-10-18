# Migration from Mock APIs to Firebase

## Current State Analysis

### Apps Using Firebase ✅
1. **TV Display** - Using Firebase Firestore via `apps/tv-display/src/services/dataService.ts`
2. **Patient Registration** - Using Firebase Firestore via `apps/patient-registration/src/services/registration.ts`

### Apps Using Mock APIs ❌
1. **Kiosk** - Using localStorage via `apps/kiosk/src/services/queueService.ts`
2. **Dashboard** - Using mockApi via `apps/dashboard/src/services/mockApi.ts`

## Migration Plan

### 1. Kiosk Migration (apps/kiosk)

**Current Implementation:**
- File: `apps/kiosk/src/services/queueService.ts`
- Storage: localStorage
- Functions:
  - `generateQueueNumber()` - Increments counter in localStorage
  - `getQueueStats()` - Reads stats from localStorage
  - `resetQueueCounter()` - Clears localStorage

**Firebase Implementation Needed:**
```typescript
// Replace localStorage with Firestore
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@shared/firebase/config';

// Counter collection: /queueCounter/{date}
// Patients collection: /patients/{patientId}

async function generateQueueNumber() {
  // 1. Get/increment daily counter from /queueCounter/2025-10-18
  // 2. Create patient document in /patients/{patientId}
  // 3. Emit WebSocket event
  // 4. Return queue data
}
```

**Changes Required:**
- Replace localStorage.getItem/setItem with Firestore reads/writes
- Use Firestore transactions for counter increment (atomic)
- Store patients in `/patients` collection
- Keep WebSocket emit (already implemented)

---

### 2. Dashboard Migration (apps/dashboard)

**Current Implementation:**
- File: `apps/dashboard/src/services/mockApi.ts`
- Storage: localStorage with mock data
- Functions:
  - `getRooms()` - Returns mock room data
  - `getRegisteredPatients()` - Returns mock patients
  - `getUnregisteredQueue()` - Returns mock queue
  - `assignPatientToRoom()` - Updates localStorage
  - `completeConsultation()` - Updates localStorage
  - etc.

**Firebase Implementation Needed:**
```typescript
// Replace mockApi with Firestore queries
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@shared/firebase/config';

// Rooms collection: /rooms/{roomId}
// Patients collection: /patients/{patientId}

async function getRegisteredPatients() {
  const q = query(
    collection(db, 'patients'),
    where('status', '==', 'registered')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
}
```

**Changes Required:**
- Create new file: `apps/dashboard/src/services/firebaseApi.ts`
- Implement all mockApi functions using Firestore
- Update DashboardContext to import from firebaseApi instead of mockApi
- Keep WebSocket listeners (already implemented)

---

## Migration Steps

### Phase 1: Kiosk Migration ✅ COMPLETE

1. ✅ Firebase emulators running
2. ✅ Firestore rules updated (open for development)
3. ✅ Create Firebase queue service
4. ✅ Update queueService.ts to use Firestore
5. ✅ Test queue generation with emulator
6. ✅ Verify WebSocket events still work
7. ✅ Backup original: queueService.mock.ts created
8. ✅ Fix project ID mismatch in .env files

### Phase 2: Dashboard Migration ✅ COMPLETE

1. ✅ Create firebaseApi.ts service
2. ✅ Implement all API functions with Firestore
3. ✅ Update DashboardContext imports
4. ✅ Backup original: mockApi.backup.ts created
5. ⏳ Test all Dashboard features
6. ⏳ Verify WebSocket events still work

### Phase 3: End-to-End Testing

1. ⏳ Generate queue number (Kiosk → Firestore)
2. ⏳ Register patient (Registration → Firestore)
3. ⏳ View in Dashboard (Dashboard ← Firestore)
4. ⏳ Call to room (Dashboard → Firestore)
5. ⏳ View on TV Display (TV ← Firestore)
6. ⏳ Complete consultation (Dashboard → Firestore)

---

## Firestore Collections Structure

### `/queueCounter/{date}`
```javascript
{
  date: "2025-10-18",
  counter: 15,
  lastUpdated: Timestamp
}
```

### `/patients/{patientId}`
```javascript
{
  queueNumber: 1,
  status: "pending" | "registered" | "called" | "completed",
  name: "John Doe",  // null if not registered
  phone: "+1234567890",
  age: 30,
  gender: "male",
  notes: "...",
  roomNumber: 3,  // null if not assigned
  createdAt: Timestamp,
  registeredAt: Timestamp,
  calledAt: Timestamp,
  completedAt: Timestamp
}
```

### `/rooms/{roomNumber}`
```javascript
{
  number: 1,
  name: "Room 1",
  status: "available" | "occupied" | "paused",
  currentPatient: "patient-id",  // null if empty
  doctorName: "Dr. Smith",
  lastActivity: Timestamp
}
```

---

## Benefits of Migration

1. **Data Persistence**: Data survives browser refresh/close
2. **Multi-User Support**: Multiple dashboards see same data
3. **Real-Time Sync**: Firestore + WebSocket for instant updates
4. **Production Ready**: Easy to deploy to production
5. **Data Inspection**: Use Emulator UI to view/edit data
6. **Backup/Export**: Can export/import data
7. **Query Power**: Complex queries, filtering, sorting

---

## Rollback Plan

If migration causes issues:
1. Keep mockApi.ts file (don't delete)
2. Switch import back to mockApi in DashboardContext
3. Keep original queueService.ts as queueService.mock.ts backup

---

## Testing Checklist

- [ ] Kiosk: Generate queue number → saved to Firestore
- [ ] Kiosk: View queue stats → reads from Firestore
- [ ] Dashboard: View registered patients → reads from Firestore
- [ ] Dashboard: View unregistered queue → reads from Firestore
- [ ] Dashboard: Assign patient to room → updates Firestore
- [ ] Dashboard: Complete consultation → updates Firestore
- [ ] TV Display: See all updates in real-time
- [ ] WebSocket: All events still broadcast correctly
- [ ] Emulator UI: Can view all data in Firestore tab

---

## Next Steps

1. Run this migration
2. Test thoroughly with emulators
3. Export sample test data
4. Document any issues
5. Update README with Firebase setup instructions
