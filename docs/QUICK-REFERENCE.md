# 🚀 Quick Reference - Automated Cleanup System

## ✅ Current Status

**Automated Cleanup**: ✅ DEPLOYED & ACTIVE
**Runs**: Every night at midnight (America/New_York)
**Function**: `resetDailyQueue`
**Cost**: $0/month (within free tier)

---

## 📋 Quick Commands

### View Deployed Functions
```bash
firebase functions:list
```

### View Function Logs
```bash
firebase functions:log
```

### Redeploy After Changes
```bash
cd functions
npm run build
firebase deploy --only functions:resetDailyQueue
```

### Manual Cleanup (Browser Console)
1. Open: https://geraldina-queue-manager-receptionist.web.app
2. Press F12
3. Copy script from `apps/dashboard/cleanup-old-patients.js`
4. Run: `cleanupOldPatients()`

---

## 🔗 Important Links

### Firebase Console
- **Functions**: https://console.firebase.google.com/project/geraldina-queue-manager/functions
- **Firestore**: https://console.firebase.google.com/project/geraldina-queue-manager/firestore
- **Usage & Billing**: https://console.firebase.google.com/project/geraldina-queue-manager/usage

### Google Cloud Console
- **Functions**: https://console.cloud.google.com/functions/list?project=geraldina-queue-manager
- **Scheduler**: https://console.cloud.google.com/cloudscheduler?project=geraldina-queue-manager
- **Billing**: https://console.cloud.google.com/billing

### Application URLs
- **Dashboard**: https://geraldina-queue-manager-receptionist.web.app
- **Patient Registration**: https://geraldina-queue-manager-patient.web.app
- **Kiosk**: https://geraldina-queue-manager-kiosk.web.app
- **TV Display**: https://geraldina-queue-manager-tv.web.app

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `functions/src/queue/resetDailyQueue.ts` | Automated cleanup function source |
| `apps/dashboard/cleanup-old-patients.js` | Manual browser cleanup script |
| `docs/DEPLOYMENT-SUCCESS.md` | Full deployment guide |
| `docs/AUTOMATED-CLEANUP.md` | Technical documentation |

---

## 🎯 What Gets Cleaned Up

Every midnight, the function automatically:
1. ✅ Deletes ALL patients from previous days
2. ✅ Deletes old queue counter documents
3. ✅ Resets all rooms to "available" status

**Keeps**: Only today's data

---

## ⏰ Schedule

**Time**: 00:00 AM (midnight)
**Timezone**: America/New_York
**Frequency**: Daily

**In other timezones**:
- Manila (UTC+8): 1:00 PM
- London (UTC+0): 5:00 AM
- Los Angeles (UTC-8): 9:00 PM (previous day)

---

## 💰 Cost Monitoring

**Expected**: $0/month (within free tier)
**Monitor**: https://console.firebase.google.com/project/geraldina-queue-manager/usage

Set up budget alert for $10/month as safety net.

---

## 🆘 Troubleshooting

### Function not running?
1. Check logs: `firebase functions:log`
2. Verify it's active: `firebase functions:list`
3. Check Cloud Scheduler

### Patients not being deleted?
1. Check function logs for errors
2. Run manual cleanup to verify logic works
3. Check Firestore rules aren't blocking deletes

### Need immediate cleanup?
Run manual browser console script (see above)

---

## 📞 Support

- **Firebase Docs**: https://firebase.google.com/docs/functions
- **Documentation**: See [DEPLOYMENT-SUCCESS.md](DEPLOYMENT-SUCCESS.md)
- **Manual Cleanup**: See [README-CLEANUP.md](README-CLEANUP.md)

---

**Last Updated**: 2025-10-27
**Status**: ✅ Production Ready
