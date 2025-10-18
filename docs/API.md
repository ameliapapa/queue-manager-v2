# API Reference

## Cloud Functions

### `generateQueueNumber`

Generates a new queue number for a patient.

**Type:** Callable HTTPS Function

**Request:**
```typescript
// No parameters required
// Called from client: httpsCallable(functions, 'generateQueueNumber')()
```

**Response:**
```typescript
{
  success: boolean;
  queueNumber: number;        // e.g., 1, 2, 3, ...
  patientId: string;          // Firestore document ID
  registrationUrl: string;    // Full URL with queue number
}
```

**Errors:**
- `resource-exhausted`: Queue is full for today (reached MAX_QUEUE_NUMBER)
- `internal`: Server error

**Example:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateQueueNumber = httpsCallable(functions, 'generateQueueNumber');

try {
  const result = await generateQueueNumber();
  console.log('Queue number:', result.data.queueNumber);
  console.log('Registration URL:', result.data.registrationUrl);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### `generatePrintTicket`

Generates HTML ticket with QR code for printing.

**Type:** Callable HTTPS Function

**Request:**
```typescript
{
  queueNumber: number;
  registrationUrl: string;
  patientId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  ticketHtml: string;          // Complete HTML for printing
  qrCodeDataUrl: string;       // Base64 QR code image
  printJobId: string;          // Firestore document ID
  timestamp: string;           // Human-readable timestamp
}
```

**Errors:**
- `invalid-argument`: Missing required fields
- `internal`: Error generating QR code or HTML

**Example:**
```typescript
const generatePrintTicket = httpsCallable(functions, 'generatePrintTicket');

try {
  const result = await generatePrintTicket({
    queueNumber: 1,
    registrationUrl: 'https://example.com/register?q=1',
    patientId: 'abc123'
  });

  // Print the ticket
  const printWindow = window.open('', '_blank');
  printWindow.document.write(result.data.ticketHtml);
  printWindow.document.close();
  printWindow.print();
} catch (error) {
  console.error('Error:', error.message);
}
```

---

### `resetDailyQueue`

Scheduled function to reset queue counter daily at midnight.

**Type:** Scheduled Function (PubSub)

**Schedule:** Daily at midnight (configurable)

**Actions:**
1. Archives incomplete patients from previous day
2. Resets all rooms to "available" status
3. Clears current patient assignments

**Configuration:**
```env
QUEUE_RESET_HOUR=0  # Hour to run (0-23)
```

**Manual Trigger (for testing):**
```bash
firebase functions:invoke resetDailyQueue
```

---

## Firestore Collections

### `queueCounter`

Tracks the current queue number for each day.

**Document ID:** `YYYY-MM-DD` (e.g., `2024-01-15`)

**Fields:**
```typescript
{
  date: string;              // YYYY-MM-DD
  currentNumber: number;     // Current queue number
  updatedAt: Timestamp;      // Last update time
}
```

**Security:**
- Read: Public
- Write: Cloud Functions only

**Example Query:**
```typescript
import { doc, getDoc } from 'firebase/firestore';

const today = new Date().toISOString().split('T')[0];
const counterRef = doc(db, 'queueCounter', today);
const counterDoc = await getDoc(counterRef);

if (counterDoc.exists()) {
  console.log('Current number:', counterDoc.data().currentNumber);
}
```

---

### `patients`

Stores all patient information and queue status.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  queueNumber: number;
  status: 'unregistered' | 'registered' | 'assigned' | 'completed';
  name: string | null;
  phone: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  notes: string | null;
  createdAt: Timestamp;
  registeredAt: Timestamp | null;
  assignedAt: Timestamp | null;
  completedAt: Timestamp | null;
  assignedRoomId: string | null;
  qrCodeUrl: string;
  printedAt: Timestamp | null;
}
```

**Security:**
- Read: Public
- Create: Cloud Functions only
- Update: Patients can update their own (unregistered → registered)
- Update: Receptionists can update any
- Delete: Forbidden

**Example Queries:**

**Get all registered patients (waiting):**
```typescript
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const q = query(
  collection(db, 'patients'),
  where('status', '==', 'registered'),
  orderBy('queueNumber', 'asc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const patients = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log('Waiting patients:', patients);
});
```

**Update patient registration:**
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const patientRef = doc(db, 'patients', patientId);
await updateDoc(patientRef, {
  name: 'John Doe',
  phone: '1234567890',
  age: 35,
  gender: 'male',
  notes: 'No allergies',
  status: 'registered',
  registeredAt: serverTimestamp()
});
```

**Assign patient to room:**
```typescript
await updateDoc(patientRef, {
  status: 'assigned',
  assignedRoomId: roomId,
  assignedAt: serverTimestamp()
});
```

**Mark patient as completed:**
```typescript
await updateDoc(patientRef, {
  status: 'completed',
  completedAt: serverTimestamp()
});
```

---

### `rooms`

Stores doctor room information and current status.

**Document ID:** `room1`, `room2`, etc. (or auto-generated)

**Fields:**
```typescript
{
  id: string;
  roomNumber: number;
  doctorName: string;
  status: 'available' | 'occupied' | 'paused';
  currentPatientQueue: number | null;
  updatedAt: Timestamp;
}
```

**Security:**
- Read: Public
- Write: Receptionists only

**Example Queries:**

**Get all rooms:**
```typescript
const q = query(
  collection(db, 'rooms'),
  orderBy('roomNumber', 'asc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const rooms = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log('Rooms:', rooms);
});
```

**Update room status:**
```typescript
const roomRef = doc(db, 'rooms', roomId);
await updateDoc(roomRef, {
  status: 'occupied',
  currentPatientQueue: 42,
  updatedAt: serverTimestamp()
});
```

---

### `users`

Stores user authentication and role information.

**Document ID:** Firebase Auth UID

**Fields:**
```typescript
{
  email: string;
  role: 'receptionist' | 'admin';
  createdAt: Timestamp;
}
```

**Security:**
- Read: Own document only
- Write: Admins only (via Firebase Console)

**Example Query:**
```typescript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    console.log('Role:', userDoc.data().role);
  }
}
```

---

### `printJobs`

Tracks print job status for monitoring.

**Document ID:** Auto-generated

**Fields:**
```typescript
{
  queueNumber: number;
  patientId: string;
  status: 'pending' | 'printing' | 'success' | 'failed';
  createdAt: Timestamp;
  printedAt: Timestamp | null;
  error: string | null;
}
```

**Security:**
- Read: Public
- Write: Cloud Functions only

**Example Query:**
```typescript
// Monitor print job status
const printJobRef = doc(db, 'printJobs', printJobId);
const unsubscribe = onSnapshot(printJobRef, (doc) => {
  const status = doc.data()?.status;
  console.log('Print status:', status);

  if (status === 'success') {
    console.log('Print successful!');
  } else if (status === 'failed') {
    console.error('Print failed:', doc.data()?.error);
  }
});
```

---

## Real-time Listeners

### Patient Queue Updates

```typescript
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Listen to all patients for today
const today = new Date();
today.setHours(0, 0, 0, 0);

const q = query(
  collection(db, 'patients'),
  where('createdAt', '>=', today)
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    if (change.type === 'added') {
      console.log('New patient:', change.doc.data());
    }
    if (change.type === 'modified') {
      console.log('Updated patient:', change.doc.data());
    }
    if (change.type === 'removed') {
      console.log('Removed patient:', change.doc.data());
    }
  });
});

// Clean up listener
// unsubscribe();
```

### Room Status Updates

```typescript
const roomsQuery = collection(db, 'rooms');
const unsubscribe = onSnapshot(roomsQuery, (snapshot) => {
  const rooms = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Update UI with room status
  updateRoomDisplay(rooms);
});
```

---

## Authentication

### Login (Receptionist Dashboard)

```typescript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check user role
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.data()?.role;

    if (role === 'receptionist' || role === 'admin') {
      return user;
    } else {
      throw new Error('Unauthorized');
    }
  } catch (error) {
    console.error('Login error:', error.message);
    throw error;
  }
}
```

### Logout

```typescript
import { signOut } from 'firebase/auth';

async function logout() {
  await signOut(auth);
}
```

### Auth State Observer

```typescript
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});
```

---

## Error Handling

### Common Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `permission-denied` | Security rules blocked the operation | Check authentication and permissions |
| `resource-exhausted` | Queue is full | Wait until next day or increase limit |
| `invalid-argument` | Invalid parameters | Check required fields |
| `unavailable` | Firestore temporarily unavailable | Retry with exponential backoff |
| `not-found` | Document doesn't exist | Check document ID |

### Example Error Handler

```typescript
async function handleFirestoreOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    switch (error.code) {
      case 'permission-denied':
        console.error('Permission denied. Please check authentication.');
        break;
      case 'unavailable':
        console.error('Service temporarily unavailable. Retrying...');
        // Implement retry logic
        break;
      default:
        console.error('Error:', error.message);
    }
    throw error;
  }
}
```

---

## Rate Limits

### Firestore
- Writes: 20,000/day (free tier)
- Reads: 50,000/day (free tier)
- Document reads: 1/second sustained

### Cloud Functions
- Invocations: 2,000,000/month (free tier)
- Compute time: 400,000 GB-seconds/month (free tier)

### Best Practices
- Use real-time listeners instead of polling
- Batch writes when possible
- Cache frequently accessed data
- Implement pagination for large lists

---

## Testing

### Firestore Emulator

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Mock Data

```typescript
// Create test patient
await addDoc(collection(db, 'patients'), {
  queueNumber: 999,
  status: 'registered',
  name: 'Test Patient',
  phone: '1234567890',
  age: 30,
  gender: 'male',
  notes: 'Test data',
  createdAt: serverTimestamp(),
  registeredAt: serverTimestamp(),
  assignedAt: null,
  completedAt: null,
  assignedRoomId: null,
  qrCodeUrl: 'https://example.com?q=999',
  printedAt: serverTimestamp()
});
```

---

## Performance Tips

1. **Use Indexes**: Firestore automatically creates some indexes, but complex queries require manual indexes
2. **Limit Query Results**: Use `limit()` to prevent large data transfers
3. **Offline Persistence**: Enable for better user experience
4. **Real-time Listeners**: More efficient than polling
5. **Batch Operations**: Use `writeBatch()` for multiple writes

---

## Support

For API issues:
- Check Firebase Console logs
- Review Firestore security rules
- Verify authentication status
- Check network connectivity
- Review [Firebase documentation](https://firebase.google.com/docs)
