# 🧹 Quick Start: Fix Patient Registration Issues

## TL;DR

Your production Firebase has old patient data blocking new registrations. Run the cleanup script to fix it.

---

## 🚀 Run Cleanup Now (5 Steps)

### 1. Open Production Dashboard
Go to: `https://geraldina-queue-manager-receptionist.web.app`

### 2. Open Browser Console
Press `F12` (Windows) or `Cmd+Option+J` (Mac)

### 3. Copy & Paste the Script
Copy the entire contents of [`cleanup-old-patients.js`](cleanup-old-patients.js) and paste into console

### 4. Run the Cleanup
Type: `cleanupOldPatients()` and press Enter

### 5. Verify Success
You should see:
```
✅ CLEANUP COMPLETE!
📊 Total Patients Deleted: 52+ (or similar number)
📊 Total Patients Kept: [today's patients]
```

---

## ✅ What This Fixes

- ✅ Patient registration now works correctly
- ✅ Queue numbers no longer conflict
- ✅ Dashboard performance improved
- ✅ Database decluttered

---

## 📚 Full Documentation

- **Step-by-step guide**: [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md)
- **System overview**: [CLEANUP-SUMMARY.md](CLEANUP-SUMMARY.md)
- **Main issues tracker**: [../../ISSUES.md](../../ISSUES.md)

---

## ⚠️ Important Notes

- This script is **safe** - only deletes old data, keeps today's patients
- It's **future-proof** - works correctly regardless of when you run it
- You may need to run this **daily** until automated cleanup is implemented
- All deletions are **permanent** - old patient data will be removed

---

## 🔧 For Developers

### Test Locally First
```bash
# Start Firebase emulators first
cd /path/to/queue-manager-v2
firebase emulators:start

# In another terminal, seed test data
node apps/dashboard/seed-test-patients.mjs

# Run cleanup
node apps/dashboard/cleanup-old-patients.mjs

# Verify - should show 0 deleted
node apps/dashboard/cleanup-old-patients.mjs
```

### Files Overview
- `cleanup-old-patients.js` - Browser console version (for production)
- `cleanup-old-patients.mjs` - Node.js version (for local testing)
- `seed-test-patients.mjs` - Test data generator (development only)

---

## 🤝 Need Help?

If you encounter any errors or issues:
1. Check [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md) troubleshooting section
2. Verify you're logged into the dashboard
3. Ensure Firebase is fully loaded before running the script

---

## Next: Automate This! 🤖

After running the initial cleanup, consider implementing automated daily cleanup:
- **Option A**: Firebase Cloud Function (recommended)
- **Option B**: Client-side midnight cleanup
- **Option C**: Continue manual daily cleanup

See [CLEANUP-SUMMARY.md](CLEANUP-SUMMARY.md#long-term-recommendations) for details.
