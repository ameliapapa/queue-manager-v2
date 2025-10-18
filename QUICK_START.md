# Quick Start Guide - Testing in 2 Minutes

## Step 1: Initialize Rooms (One-time setup)

1. Open **Dashboard**: http://localhost:3003
2. Press **F12** (open DevTools)
3. Go to **Console** tab
4. Type: `window.initRooms()`
5. Press **Enter**
6. **Refresh** the Dashboard page

You should now see 5 rooms (Room 101-105) in the Dashboard.

---

## Step 2: Test Complete Flow

### A. Generate Queue Number
- **Open Kiosk**: http://localhost:3001
- Click **"Get Queue Number"**
- Copy the registration URL from the ticket

### B. Register Patient
- **Paste URL** in browser (or scan QR code)
- **Fill form**:
  - Name: John Doe
  - Phone: 555-1234
  - Age: 45
  - Gender: Male
- Click **Submit**

### C. Assign to Room
- **Go to Dashboard**: http://localhost:3003
- Find **"John Doe (Q001)"** in "Registered Patients"
- Click **"Assign to Room"**
- Select **"Room 101"**
- Click **Confirm**

### D. View on TV Display
- **Open TV Display**: http://localhost:3004
- See **Queue 001** assigned to **Room 101**

### E. Complete Consultation
- **Back to Dashboard**
- Find **Room 101** (showing John Doe)
- Click **"Complete Consultation"**
- Room becomes **Available** again

---

## Service URLs

| App | URL |
|-----|-----|
| Kiosk | http://localhost:3001 |
| Patient Registration | http://localhost:3002 |
| Dashboard | http://localhost:3003 |
| TV Display | http://localhost:3004 |
| Firestore Emulator UI | http://localhost:4000 |

---

## Troubleshooting

**No rooms showing?**
→ Run `window.initRooms()` in Dashboard console

**Permission denied?**
→ Check Firebase emulator is running: http://localhost:4000

**Not updating in real-time?**
→ Check WebSocket connection in Dashboard (should show "Connected")

---

For detailed testing scenarios, see [TESTING_GUIDE.md](TESTING_GUIDE.md)
