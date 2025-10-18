# Debugging Consultation Completion Issues

## Problem
After completing a consultation:
1. Room status doesn't change to "available"
2. Completed patients count stays at 0

## How to Debug

### Step 1: Check Browser Console Logs

Open Dashboard (http://localhost:3003) and open DevTools (F12) → Console tab.

When you click "Complete Consultation", you should see:
```
✅ Completing consultation in room room-1
✅ Consultation completed
✅ Consultation completed (notification)
✅ Rooms updated: 5
✅ All patients updated: X
```

If you see:
- `❌ Error completing consultation` - There's an error in the function
- `Room not found` - Room ID doesn't match Firestore
- `No patient in room` - Room's currentPatient is null/undefined

### Step 2: Check Firestore Emulator UI

1. Open: http://localhost:4000
2. Click "Firestore" in sidebar
3. Navigate to `/rooms/{roomId}`
4. Click "Complete Consultation" in Dashboard
5. **Watch the Firestore UI** - you should see:
   - Room's `status` change from "busy" → "available"
   - Room's `currentPatient` change to `null`
   - Room's `lastUpdated` timestamp update

6. Navigate to `/patients/{patientId}`
7. You should see:
   - Patient's `status` change from "assigned" → "completed"
   - Patient's `completedAt` timestamp added

### Step 3: Check Real-Time Listeners

In Dashboard console, when the page loads you should see:
```
🔄 Setting up Firestore real-time listeners...
✅ Registered patients updated: X
✅ Unregistered queue updated: X
✅ Rooms updated: 5
✅ All patients updated: X
```

If you DON'T see these logs, the listeners aren't setting up correctly.

### Step 4: Manual Test in Firestore UI

1. Open Firestore Emulator UI (http://localhost:4000)
2. Find a room with `status: "busy"`
3. Manually edit:
   - Change `status` to `"available"`
   - Delete `currentPatient` field (or set to `null`)
4. **Watch the Dashboard** - the room should update instantly

If the Dashboard DOES update → listeners are working, problem is in `completeConsultation` function
If the Dashboard DOESN'T update → listeners aren't working properly

### Step 5: Check Network Tab

In Dashboard DevTools → Network tab:
1. Click "Complete Consultation"
2. Look for Firestore REST API calls
3. You should see:
   - `PATCH /rooms/{roomId}` - updating room
   - `PATCH /patients/{patientId}` - updating patient

If these requests fail (red), check the response for error details.

## Common Issues & Solutions

### Issue 1: "Room not found"
**Cause**: Room ID mismatch
**Solution**: Check that `room.id` matches the document ID in `/rooms` collection

### Issue 2: "No patient in room"
**Cause**: `room.currentPatient` is null
**Solution**: Check if patient was actually assigned. Look at room document in Firestore UI.

### Issue 3: Updates happen but UI doesn't refresh
**Cause**: Real-time listeners not working
**Solutions**:
- Check console for listener setup logs
- Verify Firebase emulator is running
- Check for JavaScript errors blocking execution
- Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Issue 4: Firestore permission denied
**Cause**: Security rules blocking writes
**Solution**: Check `firestore.rules` - should allow writes for development:
```javascript
match /rooms/{roomId} {
  allow read: if true;
  allow write: if true;  // Open for local development
}

match /patients/{patientId} {
  allow read: if true;
  allow write: if true;  // Open for local development
}
```

### Issue 5: Completed count stays at 0
**Cause**: `completedAt` timestamp not being set correctly
**Debug**:
1. Check Firestore UI for a completed patient
2. Verify `completedAt` field exists and has a valid timestamp
3. Check `status` === "completed"
4. Verify `createdAt` is today's date

The DailyStatsOverview filters by:
```typescript
p.status === 'completed' &&
p.completedAt &&
new Date(p.completedAt) >= today
```

## Quick Fix Script

If you suspect stale data, run this in Dashboard console:
```javascript
// Force refresh by reloading the page
window.location.reload();
```

## Expected Firestore Document Changes

### Before Completion:

**Room document** (`/rooms/room-1`):
```json
{
  "status": "busy",
  "currentPatient": {
    "id": "patient-123",
    "queueNumber": 1,
    "name": "John Doe",
    "age": 45,
    "gender": "male"
  },
  "lastUpdated": "2025-10-18T12:00:00Z"
}
```

**Patient document** (`/patients/patient-123`):
```json
{
  "queueNumber": 1,
  "status": "assigned",
  "name": "John Doe",
  "assignedAt": "2025-10-18T12:00:00Z",
  "completedAt": null
}
```

### After Completion:

**Room document** (`/rooms/room-1`):
```json
{
  "status": "available",  ← Changed
  "currentPatient": null,  ← Changed
  "lastUpdated": "2025-10-18T12:05:00Z"  ← Updated
}
```

**Patient document** (`/patients/patient-123`):
```json
{
  "queueNumber": 1,
  "status": "completed",  ← Changed
  "name": "John Doe",
  "assignedAt": "2025-10-18T12:00:00Z",
  "completedAt": "2025-10-18T12:05:00Z"  ← Added
}
```

## Still Not Working?

If none of the above helps, share:
1. Browser console logs (full output)
2. Firestore Emulator UI screenshots showing the room/patient documents
3. Network tab showing the API requests/responses
4. Any error messages
