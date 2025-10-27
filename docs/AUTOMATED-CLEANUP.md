# Automated Daily Cleanup - Cloud Function

## Overview

The `resetDailyQueue` Cloud Function now includes **automatic daily cleanup** of old patient data and queue counters. It runs at midnight every day.

## What It Does

### 1. Deletes Old Patients
- Removes **ALL** patient documents from previous days
- Keeps **ONLY** today's patients
- Uses batched writes for efficient deletion (handles 500+ records)

### 2. Deletes Old Queue Counters
- Removes queue counter documents from previous days
- Keeps only today's counter
- Prevents database clutter

### 3. Resets Room Statuses
- Resets all rooms to "available" status
- Clears current patient assignments
- Fresh start for each day

## Schedule

**Runs**: Every day at midnight (00:00)
**Timezone**: America/New_York
**Trigger**: Cloud Scheduler (Pub/Sub)

To change the hour, set environment variable:
```bash
firebase functions:config:set runtime.queue_reset_hour="1"  # 1 AM
```

## Deployment

### Deploy the Function
```bash
cd functions
npm run build
firebase deploy --only functions:resetDailyQueue
```

### First-Time Setup
If this is your first Cloud Function deployment:
1. Ensure you're on Firebase **Blaze (Pay as you go)** plan
2. Enable Cloud Scheduler API in Google Cloud Console
3. Deploy with: `firebase deploy --only functions`

## Monitoring

### View Logs
```bash
firebase functions:log --only resetDailyQueue
```

### Expected Log Output
```
🧹 Starting daily queue reset and cleanup for 2025-10-27
Step 1: Cleaning up old patients...
✅ Patients cleanup: Deleted 52, Kept 3
Step 2: Cleaning up old queue counters...
✅ Counters cleanup: Deleted 7, Kept 1
Step 3: Resetting room statuses...
✅ Reset 4 rooms to available status
═══════════════════════════════════════
✅ Daily queue reset and cleanup completed successfully for 2025-10-27
📊 Patients Deleted: 52
📊 Patients Kept: 3
📊 Queue Counters Deleted: 7
📊 Rooms Reset: 4
═══════════════════════════════════════
```

## Cost Estimate

### Firebase Blaze Plan Costs
- **Cloud Functions**: ~$0.40/month
  - Runs once per day = 30 invocations/month
  - ~2 seconds execution time
  - Free tier: 2M invocations, 400K GB-seconds
- **Cloud Scheduler**: Free (up to 3 jobs)
- **Firestore Operations**: Minimal
  - Reads: ~100/day (checking all documents)
  - Deletes: Variable (depends on old data)
  - Free tier: 50K reads, 20K writes per day

**Total Estimated Cost**: $0-$1/month (well within free tier for small hospital)

## Manual Trigger (Testing)

You can manually trigger the function for testing:

```bash
# Using Firebase CLI
firebase functions:shell
> resetDailyQueue()
```

Or call it via HTTP (if you add HTTP trigger):
```bash
curl -X POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/resetDailyQueue
```

## Fallback: Browser Console Script

If the Cloud Function fails or you need immediate cleanup, you can still use the browser console script:

1. Open dashboard: `https://geraldina-queue-manager-receptionist.web.app`
2. Press F12 to open console
3. Run the script from `apps/dashboard/cleanup-old-patients.js`

See: [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md)

## Troubleshooting

### Function Not Running
1. Check Cloud Scheduler is enabled
2. Verify function deployed successfully: `firebase functions:list`
3. Check logs: `firebase functions:log`

### Permission Errors
Ensure Firebase Admin SDK has proper permissions (should be automatic for Cloud Functions)

### Wrong Timezone
Update timezone in `functions/src/queue/resetDailyQueue.ts`:
```typescript
.timeZone('Asia/Manila')  // Philippines
.timeZone('Europe/London')  // UK
```

Then rebuild and redeploy.

## Code Location

- **Source**: [functions/src/queue/resetDailyQueue.ts](../functions/src/queue/resetDailyQueue.ts)
- **Compiled**: `functions/lib/queue/resetDailyQueue.js`
- **Main export**: [functions/src/index.ts](../functions/src/index.ts)

## Benefits Over Manual Cleanup

✅ **Fully Automated** - No human intervention needed
✅ **Consistent** - Runs every day at the same time
✅ **Reliable** - Server-side, doesn't depend on client being open
✅ **Efficient** - Uses batched writes for better performance
✅ **Monitored** - Logs available for auditing
✅ **Professional** - Production-ready solution

## Migration from Manual Cleanup

1. ✅ Deploy this Cloud Function
2. ✅ Wait 24 hours and verify it runs successfully
3. ⚠️ Keep browser console script as backup
4. 📅 Remove manual cleanup from daily workflow

---

**Status**: Ready to deploy
**Last Updated**: 2025-10-27
**Version**: 1.0.0
