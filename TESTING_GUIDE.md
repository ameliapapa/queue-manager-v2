# Complete End-to-End Testing Guide

This guide walks you through testing the entire queue management system from queue generation to consultation completion.

## Prerequisites

Make sure all services are running:

```bash
# Check if services are running
lsof -ti:3001,3002,3003,3004,3005,8080

# If not running, start them:
# Terminal 1: Firebase Emulators
firebase emulators:start --only firestore,auth

# Terminal 2: WebSocket Server
cd apps/websocket-server && npm run dev

# Terminal 3: Kiosk App
cd apps/kiosk && npm run dev

# Terminal 4: Patient Registration App
cd apps/patient-registration && npm run dev

# Terminal 5: Dashboard App
cd apps/dashboard && npm run dev

# Terminal 6: TV Display App
cd apps/tv-display && npm run dev
```

## Service URLs

- **Kiosk**: http://localhost:3001
- **Patient Registration**: http://localhost:3002
- **Dashboard**: http://localhost:3003
- **TV Display**: http://localhost:3004
- **WebSocket Server**: ws://localhost:3005
- **Firestore Emulator**: http://localhost:8080
- **Firestore Emulator UI**: http://localhost:4000

---

## Step-by-Step Testing Flow

### Step 1: Initialize Rooms in Firestore

The Dashboard needs rooms to assign patients to. Initialize them using the browser console:

1. **Open Dashboard** in your browser: http://localhost:3003
2. **Open Browser DevTools** (F12 or right-click → Inspect)
3. **Go to Console tab**
4. **Run this command**:
   ```javascript
   window.initRooms()
   ```
5. **Wait for confirmation**: You should see "Sample rooms initialized"
6. **Refresh the Dashboard page** - You should now see 5 rooms displayed

**What you should see:**
- 5 consultation rooms (Room 101-105)
- Each with a doctor name
- All showing "Available" status
- No patients assigned

---

### Step 2: Generate Queue Number (Kiosk)

Test the queue number generation flow:

1. **Open Kiosk App**: http://localhost:3001
2. **Click "Get Queue Number" button**
3. **Wait for ticket to generate** (should take 1-2 seconds)

**What you should see:**
- A ticket with queue number (e.g., "001")
- A QR code
- A registration URL (e.g., http://localhost:3002/register?queue=1&patient=abc123)
- Print button (won't actually print without thermal printer)

**What happens in Firestore:**
- A counter document is created/updated in `/queueCounter/2025-10-18`
- A patient document is created in `/patients/{patientId}` with:
  - `queueNumber: 1`
  - `status: 'pending'`
  - `createdAt: <timestamp>`

**Verify in Firestore UI:**
1. Open http://localhost:4000
2. Click "Firestore" in left sidebar
3. Check `/queueCounter/2025-10-18` - should show `counter: 1`
4. Check `/patients` - should see new patient with status: "pending"

---

### Step 3: View Unregistered Queue (Dashboard)

1. **Open Dashboard**: http://localhost:3003
2. **Look at "Unregistered Queue" section** (usually on the left side)

**What you should see:**
- Queue number 001
- "Issued X minutes ago" timestamp
- No patient details (name, phone, etc. are null)

---

### Step 4: Register Patient (Patient Registration App)

Option A: **Use QR Code** (if you have a phone/camera)
- Scan the QR code from the Kiosk ticket
- It will open the registration form

Option B: **Use URL directly**
1. Copy the registration URL from the Kiosk ticket
2. Paste it in your browser: http://localhost:3002/register?queue=1&patient=abc123

**Fill out the registration form:**
- **Name**: John Doe
- **Phone**: 555-1234
- **Age**: 45
- **Gender**: Male
- **Notes**: Routine checkup

**Submit the form**

**What you should see:**
- Success message: "Registration successful!"
- Queue number confirmation
- Option to go back

**What happens in Firestore:**
- Patient document in `/patients/{patientId}` is updated:
  - `status: 'pending'` → `status: 'registered'`
  - `name: 'John Doe'`
  - `phone: '555-1234'`
  - `age: 45`
  - `gender: 'male'`
  - `registeredAt: <timestamp>`

**WebSocket Event:**
- Event `patient:registered` is broadcast
- Dashboard receives update automatically

---

### Step 5: View Registered Patient (Dashboard)

The Dashboard should **automatically update** via WebSocket.

**What you should see:**
- Queue number 001 **disappears from "Unregistered Queue"**
- Queue number 001 **appears in "Registered Patients"** section
- Full patient details visible:
  - Name: John Doe
  - Phone: 555-1234
  - Age: 45
  - Gender: Male
  - Notes: Routine checkup
- Green notification at top: "John Doe registered (Q001)"

**If not updating automatically:**
- Click "Refresh" button in Dashboard
- Check WebSocket connection status (should show "Connected")

---

### Step 6: Assign Patient to Room (Dashboard)

1. **In Dashboard, find the registered patient** (John Doe, Q001)
2. **Click "Assign to Room" button** next to the patient
3. **Select a room** from the dropdown (e.g., Room 101 - Dr. Sarah Johnson)
4. **Confirm assignment**

**What you should see:**
- Patient **disappears from "Registered Patients"** list
- Room 101 status changes from "Available" to "Busy"
- Room 101 now shows patient details:
  - Queue: 001
  - Name: John Doe
  - Age: 45
  - Notes: Routine checkup
- Success notification: "Patient assigned successfully"

**What happens in Firestore:**
- Patient document updated:
  - `status: 'registered'` → `status: 'assigned'`
  - `roomId: 'room-1'`
  - `assignedAt: <timestamp>`
  - `calledAt: <timestamp>`
- Room document updated:
  - `status: 'available'` → `status: 'busy'`
  - `currentPatient: { id, queueNumber, name, age, gender, notes }`
  - `lastUpdated: <timestamp>`

**WebSocket Event:**
- Event `patient:assigned` is broadcast
- TV Display receives update automatically

---

### Step 7: View Patient Call on TV Display

1. **Open TV Display**: http://localhost:3004

**What you should see:**
- Large display showing all rooms
- Room 101 highlighted or showing "NOW SERVING"
- Patient details:
  - **QUEUE 001**
  - **Room 101**
  - **Dr. Sarah Johnson**
- Other rooms showing "Available" or "Waiting"

**Purpose:**
- Patients in waiting room can see which queue numbers are being called
- They know which room to go to

---

### Step 8: Complete Consultation (Dashboard)

1. **In Dashboard, find Room 101** (the busy room with John Doe)
2. **Click "Complete Consultation" button**
3. **Confirm completion**

**What you should see:**
- Room 101 status changes from "Busy" to "Available"
- Room 101 no longer shows patient details
- Patient details are cleared
- Success notification: "Consultation completed"

**What happens in Firestore:**
- Patient document updated:
  - `status: 'assigned'` → `status: 'completed'`
  - `completedAt: <timestamp>`
- Room document updated:
  - `status: 'busy'` → `status: 'available'`
  - `currentPatient: null`
  - `lastUpdated: <timestamp>`

**WebSocket Event:**
- Event `consultation:completed` is broadcast
- TV Display updates automatically
- Dashboard refreshes room status

---

## Step 9: Test TV Display Update

**Open TV Display again**: http://localhost:3004

**What you should see:**
- Room 101 now shows "Available" status again
- No patient assigned
- Ready for next patient

---

## Additional Testing Scenarios

### Scenario A: Multiple Queue Numbers

1. **Generate 3 queue numbers** in Kiosk (001, 002, 003)
2. **Register only one** (e.g., 002)
3. **Check Dashboard**:
   - Unregistered Queue should show: 001, 003
   - Registered Patients should show: 002

### Scenario B: Multiple Patients Assigned

1. Generate and register 3 patients
2. Assign to different rooms (101, 102, 103)
3. Check TV Display - should show all 3 rooms busy with different patients

### Scenario C: Room Pause/Resume

1. **In Dashboard, find an available room** (e.g., Room 102)
2. **Click "Pause Room" button**
3. **Room status changes to "Paused"**
4. Try to assign a patient - should fail (room not available)
5. **Click "Resume Room"**
6. **Room status back to "Available"**

### Scenario D: Real-time Sync Across Dashboards

1. **Open Dashboard in two browser windows**
2. **In Window 1**: Assign patient to room
3. **In Window 2**: Should update automatically via WebSocket
4. Both windows should show identical data

### Scenario E: Update Patient Details

1. **In Dashboard, find a registered patient**
2. **Click "Edit" button**
3. **Update phone number or notes**
4. **Save changes**
5. Verify updates appear immediately

### Scenario F: Cancel Patient

1. **In Dashboard, find a registered patient**
2. **Click "Cancel" button**
3. **Enter reason**: "Patient left"
4. **Confirm**
5. Patient status → "cancelled"
6. Patient appears in cancelled/completed list

---

## Troubleshooting

### Issue: Dashboard shows no rooms

**Solution:**
- Run `window.initRooms()` in Dashboard browser console
- Refresh page
- Check Firestore emulator UI: http://localhost:4000

### Issue: WebSocket not connecting

**Solution:**
- Check WebSocket server is running on port 3005
- Check browser console for connection errors
- Restart WebSocket server: `cd apps/websocket-server && npm run dev`

### Issue: Permission denied errors

**Solution:**
- Check all .env files have `VITE_FIREBASE_PROJECT_ID=your-project-id`
- Restart all dev servers to pick up new .env
- Check firestore.rules are open for development

### Issue: Data not updating in real-time

**Solution:**
- Check WebSocket connection status in Dashboard
- Click "Refresh" button manually
- Check browser console for errors
- Verify all apps are using same Firebase project ID

### Issue: Queue counter not incrementing

**Solution:**
- Check Firestore emulator UI for `/queueCounter/2025-10-18`
- Delete the document to reset counter
- Generate new queue number

---

## Viewing Data in Firestore Emulator UI

**Open**: http://localhost:4000

**Navigate to Firestore**:
1. Click "Firestore" in left sidebar
2. Browse collections:
   - `/queueCounter/{date}` - Daily counter
   - `/patients/{patientId}` - All patients
   - `/rooms/{roomId}` - Consultation rooms

**Useful for:**
- Debugging data issues
- Verifying timestamps
- Checking patient status transitions
- Resetting data (delete documents)

---

## Expected Timeline for Complete Flow

| Step | Action | Time |
|------|--------|------|
| 1 | Initialize rooms | 5 seconds |
| 2 | Generate queue number | 2 seconds |
| 3 | View in Dashboard | Instant (WebSocket) |
| 4 | Register patient | 10-15 seconds |
| 5 | View registered patient | Instant (WebSocket) |
| 6 | Assign to room | 2 seconds |
| 7 | View on TV Display | Instant (WebSocket) |
| 8 | Complete consultation | 2 seconds |
| 9 | TV Display updates | Instant (WebSocket) |

**Total**: ~30 seconds for complete flow

---

## Success Criteria

✅ **Kiosk generates queue numbers** successfully
✅ **Queue numbers appear in Dashboard** unregistered queue
✅ **Patient registration updates Firestore** and Dashboard
✅ **Patient assignment updates room status** in real-time
✅ **TV Display shows correct patient** in correct room
✅ **Consultation completion clears room** and marks patient complete
✅ **WebSocket events trigger automatic updates** across all apps
✅ **Multiple dashboards stay in sync** via WebSocket

---

## Clean Up / Reset Testing Data

To reset all data and start fresh:

1. **Stop all services** (Ctrl+C in each terminal)
2. **Delete Firestore emulator data**:
   ```bash
   rm -rf .firebase/
   ```
3. **Restart Firebase emulator**:
   ```bash
   firebase emulators:start --only firestore,auth
   ```
4. **Restart all dev servers**
5. **Re-run** `window.initRooms()` in Dashboard console

---

## Notes

- All data is stored in **local Firebase emulator** - nothing goes to cloud
- Data **persists** between emulator restarts (stored in `.firebase/` directory)
- **WebSocket** provides instant updates without polling
- **Today's date filter** ensures only today's patients are shown
- **Atomic operations** prevent race conditions in counter generation

---

**Happy Testing!** 🎉

If you encounter any issues, check:
1. Browser console for errors
2. Terminal logs for server errors
3. Firestore emulator UI for data verification
4. WebSocket connection status in Dashboard
