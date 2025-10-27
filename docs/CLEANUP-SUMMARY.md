# Patient Cleanup System - Summary

## Overview

This directory contains scripts and documentation for cleaning up old patient data from Firebase.

## The Problem

The queue management system is designed to operate **daily**, with queue numbers resetting each day. However, patient records from previous days were accumulating in the database, causing:

1. **Registration Issues**: Queue number conflicts between old and new patients
2. **Performance Problems**: Dashboard filtering through unnecessary old data
3. **Data Clutter**: Growing database with obsolete records

### Root Cause Analysis

From [ISSUES.md](../../ISSUES.md#L3-L28):
- 52 old patient records from October 20-21, 2025 remained in production
- Dashboard strict date filtering required patients to register twice
- No automatic cleanup mechanism was in place

## The Solution

### Three-Tier Cleanup System

#### 1. Production Cleanup (Browser Console)
**File**: [cleanup-old-patients.js](cleanup-old-patients.js)

- Runs in browser console on production dashboard
- Uses existing Firebase connection from dashboard
- Deletes patients AND queue counters from previous days
- Safe and future-proof

**Usage**: See [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md)

#### 2. Local Testing (Node.js + Emulator)
**File**: [cleanup-old-patients.mjs](cleanup-old-patients.mjs)

- Runs via Node.js command line
- Connects to Firebase emulator (localhost:8080)
- Uses Firebase Admin SDK to bypass security rules
- For development/testing only

**Usage**:
```bash
node apps/dashboard/cleanup-old-patients.mjs
```

#### 3. Test Data Seeder (Development)
**File**: [seed-test-patients.mjs](seed-test-patients.mjs)

- Creates test patients with various dates
- Used to verify cleanup logic works correctly
- For development/testing only

**Usage**:
```bash
node apps/dashboard/seed-test-patients.mjs
node apps/dashboard/cleanup-old-patients.mjs
```

## Cleanup Logic (Future-Proof)

Both production and local cleanup scripts use the same core logic:

```javascript
const today = new Date().toISOString().split('T')[0]; // e.g., "2025-10-27"

// For patients
if (createdDateString !== today) {
  // Delete - patient is from a previous day
}

// For queue counters
if (counterDate !== today) {
  // Delete - counter is from a previous day
}
```

### Why This Is Future-Proof

- ✅ Always uses **current date** when script runs
- ✅ Works correctly **any day** you run it
- ✅ Keeps **only today's** data
- ✅ Deletes **all previous days** regardless of how old
- ✅ Safe to run **multiple times** (idempotent)

## Testing Results

### Local Emulator Test (2025-10-27)

**Seeded Data**:
- 3 patients from today (2025-10-27)
- 2 patients from yesterday (2025-10-26)
- 1 patient from 2 days ago (2025-10-25)
- 1 patient from last week (2025-10-20)

**Cleanup Result**: ✅ Success
- Deleted: 4 old patients
- Kept: 3 today's patients
- Verification: Second run deleted 0 (all clean)

## Files in This Directory

| File | Purpose | Environment |
|------|---------|-------------|
| `cleanup-old-patients.js` | Production cleanup via browser console | Production Firebase |
| `cleanup-old-patients.mjs` | Local cleanup via Node.js | Firebase Emulator |
| `seed-test-patients.mjs` | Test data generator | Firebase Emulator |
| `CLEANUP-INSTRUCTIONS.md` | Step-by-step guide for production | Documentation |
| `CLEANUP-SUMMARY.md` | This file - overview of system | Documentation |

## Immediate Action Required

### Run Production Cleanup Now

1. Follow instructions in [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md)
2. This will fix the current patient registration issues
3. Should take less than 1 minute

### Expected Production Results

Based on ISSUES.md, you should see approximately:
- **52+ patients deleted** (from previous days)
- **0-10 patients kept** (from today, depending on when you run it)
- **Multiple queue counters deleted** (from previous dates)
- **1 queue counter kept** (today's date)

## Long-Term Recommendations

### Option 1: Daily Manual Cleanup (Temporary)
Run the cleanup script every morning via browser console before hospital operations begin.

**Pros**:
- Simple, no code changes
- Full control over when cleanup happens

**Cons**:
- Manual effort required daily
- Risk of forgetting

### Option 2: Automated Firebase Cloud Function (Recommended)
Deploy a scheduled Cloud Function to run cleanup automatically at midnight.

**Pros**:
- Fully automated
- No manual intervention
- Reliable and consistent

**Cons**:
- Requires Firebase Blaze plan (pay-as-you-go)
- One-time setup effort

**Implementation**: Would create a new Cloud Function scheduled to run daily at midnight using `functions.pubsub.schedule()`.

### Option 3: Client-Side Midnight Auto-Cleanup
Add cleanup logic to the dashboard app that runs automatically at midnight if the app is open.

**Pros**:
- No Firebase Cloud Functions needed
- Works with free tier

**Cons**:
- Only runs if dashboard is open at midnight
- Less reliable than server-side solution

## Related Documentation

- Main issues tracker: [ISSUES.md](../../ISSUES.md)
- Firebase configuration: [firebase.json](../../firebase.json)
- Dashboard context: [apps/dashboard/src/contexts/DashboardContext.tsx](../../apps/dashboard/src/contexts/DashboardContext.tsx)
- Queue service: [apps/kiosk/src/services/queueService.ts](../../apps/kiosk/src/services/queueService.ts)

## Next Steps

1. ✅ **Immediate**: Run production cleanup using browser console script
2. ⏳ **This week**: Monitor daily to ensure cleanup is needed/performed
3. 📅 **Future**: Implement automated cleanup solution (Cloud Function or client-side)
