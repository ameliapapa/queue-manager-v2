# Production Cleanup Instructions

## Problem Being Solved

Old patient records from previous days remain in the Firebase database, causing issues with:
- Patient registration (queue number conflicts)
- Dashboard performance (filtering unnecessary data)
- Database clutter (accumulating old records)

## Solution: Daily Cleanup Script

The cleanup script removes ALL data from previous days, keeping ONLY today's data.

### What Gets Cleaned Up

1. **Old Patients** - All patient records NOT from today
2. **Old Queue Counters** - All queue counter documents NOT from today

### Safety Features

- ✅ **Future-proof**: Works correctly regardless of when you run it
- ✅ **Date-aware**: Always keeps today's data, deletes everything else
- ✅ **Detailed logging**: Shows exactly what's being deleted
- ✅ **Error handling**: Gracefully handles failures

---

## How to Run Cleanup on Production

### Step 1: Open the Dashboard

1. Go to your production dashboard URL:
   ```
   https://geraldina-queue-manager-receptionist.web.app
   ```

2. Log in if authentication is required

### Step 2: Open Browser Console

- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+J` (Windows) / `Cmd+Option+J` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)
- **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

### Step 3: Copy the Cleanup Script

1. Open the file: `apps/dashboard/cleanup-old-patients.js`
2. Copy the ENTIRE contents of the file (all 89 lines)

### Step 4: Paste and Run

1. Paste the script into the browser console
2. Press `Enter` - you should see a message:
   ```
   To clean up old patients, run: cleanupOldPatients()
   ```

3. Run the cleanup function by typing:
   ```javascript
   cleanupOldPatients()
   ```

4. Press `Enter`

### Step 5: Review the Output

You'll see output like this:

```
🧹 Starting cleanup for data not from 2025-10-27
📅 Today's date: 2025-10-27

Step 1: Cleaning up old patients...
  🗑️  Deleting old patient: patient-2025-10-26-5-... (created: 2025-10-26)
  🗑️  Deleting old patient: patient-2025-10-25-12-... (created: 2025-10-25)
  ...
  ✅ Patients cleanup: Deleted 52, Kept 3

Step 2: Cleaning up old queue counters...
  🗑️  Deleting old queue counter: 2025-10-26
  🗑️  Deleting old queue counter: 2025-10-25
  ...
  ✅ Counters cleanup: Deleted 7, Kept 1

═══════════════════════════════════════
✅ CLEANUP COMPLETE!
═══════════════════════════════════════
📊 Total Patients Deleted: 52
📊 Total Patients Kept: 3
📊 Total Queue Counters Deleted: 7
📊 Total Queue Counters Kept: 1
═══════════════════════════════════════
```

### Step 6: Verify

After cleanup:
1. Check that today's patients still appear in the dashboard
2. Try registering a new patient to confirm it works
3. The dashboard should feel more responsive

---

## When to Run This Cleanup

### Immediate (One-time)
Run NOW to clean up existing old patient data and fix the current registration issues.

### Future Runs

**Option A: Manual Daily Cleanup** (Temporary solution)
- Run this script every morning before the hospital opens
- Takes ~30 seconds
- Ensures fresh start each day

**Option B: Automated Cleanup** (Recommended long-term)
Deploy Firebase Cloud Functions to run cleanup automatically:
- Scheduled function runs at midnight
- No manual intervention needed
- See `FUTURE-AUTOMATION.md` for implementation guide

---

## Troubleshooting

### Error: "Firebase not loaded"
**Cause**: Script run before dashboard page fully loaded
**Solution**: Wait for dashboard to load completely, then try again

### Error: "permission-denied"
**Cause**: Firestore security rules blocking deletion
**Solution**:
1. Check you're logged in to the dashboard
2. Verify your user account has proper permissions
3. Contact Firebase admin to check security rules

### Error: Script runs but nothing deleted
**Cause**: No old data exists (all data is from today)
**Solution**: This is normal! The script is working correctly.

---

## Files Reference

- **Browser console script**: `apps/dashboard/cleanup-old-patients.js`
- **Local testing script**: `apps/dashboard/cleanup-old-patients.mjs` (Node.js with emulator)
- **Test data seeder**: `apps/dashboard/seed-test-patients.mjs` (for local testing only)

---

## Important Notes

⚠️ **Backup Consideration**: If you want to keep historical patient data for records/analytics:
1. Export data before cleanup (use Firebase console)
2. Or implement archival system instead of deletion
3. Current script PERMANENTLY DELETES old data

✅ **Safe to Run**: The script only affects data NOT from today, so it's safe to run multiple times per day.

🔄 **Idempotent**: Running the script multiple times has the same effect as running it once.
