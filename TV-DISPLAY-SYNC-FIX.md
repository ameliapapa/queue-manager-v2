# TV Display Sync Fix - Room Status After Midnight Cleanup

**Issue Fixed:** TV display showing stale "in consultation" status while dashboard correctly shows "available"

**Date:** 2025-10-27
**Status:** ✅ DEPLOYED

---

## Problem Description

### Symptoms
After the midnight cleanup Cloud Function runs:
- ✅ **Reception Dashboard**: Correctly shows all rooms as "available"
- ❌ **TV Display**: Still shows rooms as "in consultation" (stale data)

### Root Cause
The Cloud Function `resetDailyQueue` was using incorrect field names when resetting the `rooms` collection:

**Incorrect (before fix):**
```typescript
batch.update(doc.ref, {
  status: 'available',
  currentPatientQueue: null,  // ❌ Wrong field name
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),  // ❌ Wrong field name
});
```

**Correct (after fix):**
```typescript
batch.update(doc.ref, {
  status: 'available',
  currentPatient: null,  // ✅ Matches dashboard schema
  lastUpdated: admin.firestore.FieldValue.serverTimestamp(),  // ✅ Matches dashboard schema
});
```

---

## Technical Details

### Firestore Schema Used by Dashboard & TV Display

Both applications use the `rooms` collection with this schema:

```typescript
interface Room {
  id: string;
  roomNumber: number;
  doctorName: string;
  status: 'available' | 'busy' | 'paused';
  currentPatient: {
    id: string;
    queueNumber: number;
    name: string;
    // ...
  } | null;
  lastUpdated: Timestamp;
}
```

### How TV Display Listens to Room Changes

**File:** `apps/tv-display/src/App.tsx` (lines 86-122)

```typescript
const roomsQ = query(
  collection(db, 'rooms'),
  orderBy('roomNumber', 'asc')
);

const unsubRooms = onSnapshot(roomsQ, (snapshot) => {
  const newRooms: Room[] = [];

  snapshot.forEach(doc => {
    const data = doc.data();

    const room: Room = {
      number: data.roomNumber,
      status: data.status === 'paused' ? 'paused' :
              data.currentPatient ? 'busy' : 'available',  // ← Checks currentPatient field
      currentPatient: data.currentPatient ? {
        id: data.currentPatient.id || '',
        queueNumber: data.currentPatient.queueNumber || 0,
        name: data.currentPatient.name,
        status: 'called',
      } : undefined,
    };

    newRooms.push(room);
  });

  setRooms(newRooms.sort((a, b) => a.number - b.number));
});
```

**Key Point:** The TV display checks `data.currentPatient` to determine if room is busy. If the Cloud Function sets `currentPatientQueue` instead, the TV display doesn't see the change.

---

## Fix Applied

### File Changed
`functions/src/queue/resetDailyQueue.ts` (lines 107-113)

### Changes Made

1. **Field name corrected:**
   - `currentPatientQueue` → `currentPatient`
   - `updatedAt` → `lastUpdated`

2. **Cloud Function redeployed:**
   ```bash
   firebase deploy --only functions:resetDailyQueue
   ```

3. **Verification:**
   ```bash
   firebase functions:list
   ```
   - Status: ✅ ACTIVE
   - Version: v1 (updated)
   - Trigger: scheduled
   - Location: us-central1

---

## How It Works Now

### Midnight Cleanup Sequence (00:00 AM America/New_York)

1. **Step 1: Delete old patients**
   - Deletes all patients from previous days
   - Keeps today's patients

2. **Step 2: Delete old queue counters**
   - Deletes queue counter documents from previous dates
   - Keeps today's counter

3. **Step 3: Reset rooms** ← **FIXED**
   ```typescript
   // For each room in Firestore:
   {
     status: 'available',        // ✅ Room available
     currentPatient: null,       // ✅ No patient assigned
     lastUpdated: <timestamp>    // ✅ Update timestamp
   }
   ```

4. **Real-time Sync:**
   - Dashboard listener receives update → Shows "available" ✅
   - TV display listener receives update → Shows "available" ✅
   - Both apps now in sync! 🎉

---

## Testing the Fix

### Option 1: Wait for Midnight (Automatic)

The Cloud Function runs automatically at midnight (00:00 AM America/New_York).

**Expected behavior:**
1. At midnight, function runs
2. Rooms reset to "available"
3. TV display updates automatically (real-time listener)
4. Both dashboard and TV display show same status

### Option 2: Manual Test (Immediate)

You can manually trigger the Cloud Function to test immediately:

#### Using Firebase Console

1. Go to: https://console.firebase.google.com/project/geraldina-queue-manager/functions
2. Find `resetDailyQueue`
3. Click "..." menu → "Test function"
4. Click "Run test"
5. Check logs for success

#### Using gcloud CLI (if available)

```bash
gcloud functions call resetDailyQueue --project geraldina-queue-manager
```

#### Create Test Rooms with Stale Data

1. Open Firebase Console: https://console.firebase.google.com/project/geraldina-queue-manager/firestore
2. Go to `rooms` collection
3. Manually set a room to:
   ```json
   {
     "status": "busy",
     "currentPatient": {
       "id": "test-patient-id",
       "queueNumber": 999,
       "name": "Test Patient"
     }
   }
   ```
4. Check TV display - should show "in consultation"
5. Trigger Cloud Function manually (see above)
6. Check TV display - should now show "available" ✅

---

## Verification Checklist

After the midnight cleanup runs (or manual trigger):

### Dashboard (Reception)
- [ ] Open: https://geraldina-queue-manager-receptionist.web.app
- [ ] Login
- [ ] Check "Rooms Available" section
- [ ] All rooms should show "available" status
- [ ] No rooms should show "busy" or have patient assigned

### TV Display
- [ ] Open: https://geraldina-queue-manager-tv.web.app
- [ ] Check room cards
- [ ] All rooms should show "E lirë" (Available)
- [ ] No rooms should show "Në konsultim" (In consultation)
- [ ] No queue numbers displayed in room cards

### Both Should Match
- [ ] Dashboard and TV display show same room statuses
- [ ] No discrepancies between the two apps

---

## Monitoring

### Check Cloud Function Logs

```bash
firebase functions:log --only resetDailyQueue
```

**Look for:**
```
🧹 Starting daily queue reset and cleanup for YYYY-MM-DD
Step 1: Cleaning up old patients...
✅ Patients cleanup: Deleted X, Kept Y
Step 2: Cleaning up old queue counters...
✅ Counters cleanup: Deleted X, Kept Y
Step 3: Resetting room statuses...
✅ Reset 5 rooms to available status
═══════════════════════════════════════
✅ Daily queue reset and cleanup completed successfully
```

### Firebase Console Monitoring

1. Go to: https://console.firebase.google.com/project/geraldina-queue-manager/functions
2. Click on `resetDailyQueue`
3. View:
   - Last execution time
   - Execution count
   - Error rate (should be 0%)
   - Logs

---

## Troubleshooting

### TV Display Still Shows Stale Data

**Possible causes:**

1. **Browser cache:**
   - Hard refresh TV display: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (macOS)
   - Or close and reopen kiosk mode

2. **Function hasn't run yet:**
   - Check last execution time in Firebase Console
   - Manually trigger function to test

3. **Real-time listener not working:**
   - Open TV display console (F12)
   - Look for errors
   - Check for: "❌ Error listening to rooms:"

4. **Network issues:**
   - Check internet connection
   - Verify can access Firebase: https://console.firebase.google.com

### Dashboard and TV Display Don't Match

**Fix:**
1. Open Firebase Console
2. Check `rooms` collection
3. Verify field names:
   - Should have: `currentPatient` (not `currentPatientQueue`)
   - Should have: `lastUpdated` (not `updatedAt`)
4. If wrong field names found, manually delete and let system recreate

---

## Related Files

| File | Purpose |
|------|---------|
| `functions/src/queue/resetDailyQueue.ts` | Cloud Function source (FIXED) |
| `functions/lib/queue/resetDailyQueue.js` | Compiled function |
| `apps/tv-display/src/App.tsx` | TV display real-time listener |
| `apps/dashboard/src/contexts/DashboardContext.tsx` | Dashboard real-time listener |
| `apps/dashboard/src/services/firebaseApi.ts` | Room schema definition |

---

## Summary

**Problem:** Field name mismatch between Cloud Function and application schema
**Solution:** Update Cloud Function to use correct field names
**Status:** ✅ Fixed and deployed
**Next Occurrence:** Midnight tonight (00:00 AM America/New_York)
**Expected Result:** TV display and dashboard will both show correct room status after cleanup

---

## Git Commit

**Commit:** `69df351`
**Message:** "Fix Cloud Function room reset field names for TV display sync"
**Pushed to:** GitHub main branch

---

**Last Updated:** 2025-10-27
**Fixed By:** Cloud Function schema correction
**Deployed:** us-central1 (ACTIVE ✅)
