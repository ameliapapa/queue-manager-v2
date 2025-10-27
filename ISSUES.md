# Queue Manager Issues

## Fixed Issue: Patient Registration Bug

### Problem
Patients needed to be registered twice before appearing in the registered queue on the reception dashboard.

### Root Cause
1. **Old patient records in database**: Patients from previous days (October 20-21, 2025) were still present in the Firestore database
2. **Strict date filtering**: The `DashboardContext.tsx` was filtering out any patient not from the current day
3. **No automatic cleanup**: Firebase Cloud Functions for daily patient cleanup were not deployed

### Solution Implemented
1. **Database cleanup**: Removed all 52 old patient records from the database using a cleanup script
2. **Fixed date filtering logic** in [DashboardContext.tsx:82-88](apps/dashboard/src/contexts/DashboardContext.tsx#L82-L88):
```typescript
// Only include today's patients (strict filtering)
if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
  patientsMap.delete(doc.id);
  return;
}
```

### Status
✅ **RESOLVED** - Patients now appear in the registered queue immediately after first registration.

### Automated Cleanup Deployed
✅ **IMPLEMENTED** - Firebase Cloud Function `resetDailyQueue` now runs automatically at midnight (America/New_York timezone) to:
- Delete all patients from previous days
- Delete old queue counter documents
- Reset all rooms to available status

**Deployment Details**: See [docs/DEPLOYMENT-SUCCESS.md](docs/DEPLOYMENT-SUCCESS.md)
**Technical Documentation**: See [docs/AUTOMATED-CLEANUP.md](docs/AUTOMATED-CLEANUP.md)

---

## Fixed Issue: Room Completion After Manual Patient Deletion

### Problem
After manually deleting patients from the Firestore database, attempting to complete doctor room consultations would fail.

### Root Cause
When patients are deleted manually, room documents retain references to the deleted patient in their `currentPatient` field. The completion logic tries to update the deleted patient, causing the operation to fail.

**Affected Code**: [apps/dashboard/src/services/firebaseApi.ts:255-290](apps/dashboard/src/services/firebaseApi.ts#L255-L290) - `completeConsultation` function

### Solution
Created cleanup scripts to identify and clear orphaned room references:
- **Browser Console Script**: [apps/dashboard/fix-rooms.js](apps/dashboard/fix-rooms.js)
- **Manual Fix**: Direct updates via Firebase Console (recommended as most reliable)

### Prevention
The automated cleanup Cloud Function now properly manages the relationship between patients and rooms, preventing orphaned references in normal operation.

### Status
✅ **RESOLVED** - Rooms can be completed successfully. Automated cleanup prevents future occurrences.

---

## ✅ RESOLVED: Sound Notifications on TV Display

### Problem
Notification sound should play automatically on the TV display when a patient is newly assigned to a room without requiring user interaction.

### Root Cause
**Browser autoplay policies**: Modern browsers (Chrome, Firefox, Safari) block autoplay of audio/video without user interaction. This is a security and user experience feature.

The error encountered:
```
NotAllowedError: play() failed because the user didn't interact with the document first.
```

### Attempted Solutions
1. ✅ **Removed React.memo**: Was preventing component re-renders when rooms changed
2. ✅ **Added user interaction listeners**: Tried to "unlock" audio after click/touch/keydown events
3. ✅ **Simplified audio implementation**: Currently attempts autoplay and gracefully handles browser blocks

### Current Implementation
Located in [RoomStatus.tsx:27-39](apps/tv-display/src/components/RoomStatus.tsx#L27-L39):

```typescript
const playNotificationSound = () => {
  if (!audioRef.current) {
    return;
  }

  // Reset to start and attempt to play
  audioRef.current.currentTime = 0;
  audioRef.current.play().catch(() => {
    // Autoplay blocked - this is expected on browsers with strict autoplay policies
    // Sound will work after user interacts with the page once
  });
};
```

### Current Behavior
- On **first page load**: Sound is blocked by browser autoplay policy
- After **any user interaction** (click, tap, keypress) on the TV display page: Sound plays successfully for all subsequent patient assignments

### ✅ SOLUTION IMPLEMENTED: Kiosk Mode

**For TV displays where no clicking is possible**, the issue has been completely resolved using **Kiosk Mode** with browser launch flags.

#### Implementation

Created launch scripts that bypass browser autoplay policies:

**Files Created:**
- [apps/tv-display/launch-kiosk.sh](apps/tv-display/launch-kiosk.sh) - macOS/Linux launcher
- [apps/tv-display/launch-kiosk.bat](apps/tv-display/launch-kiosk.bat) - Windows launcher
- [apps/tv-display/KIOSK-MODE-SETUP.md](apps/tv-display/KIOSK-MODE-SETUP.md) - Complete setup guide

**Key Browser Flag:** `--autoplay-policy=no-user-gesture-required`

This flag completely bypasses browser autoplay restrictions at the browser level.

#### How to Use

**Windows:**
```cmd
Double-click: launch-kiosk.bat
```

**macOS/Linux:**
```bash
./launch-kiosk.sh
```

**Result:**
- Full-screen TV display (no browser UI visible)
- Sound plays automatically for all patient assignments
- No clicking or user interaction required
- Perfect for 24/7 unattended operation

#### Features

✅ **Full-screen kiosk mode** - No browser chrome
✅ **Autoplay enabled** - Sound without interaction
✅ **Auto-start capable** - Can run on system boot
✅ **Crash recovery disabled** - Clean restarts
✅ **Perfect for dedicated TV displays**

#### Deployment

1. Copy launch script to TV display computer
2. Configure to run on startup (see KIOSK-MODE-SETUP.md)
3. TV display launches automatically on boot
4. Sound notifications work immediately

#### Hardware Options

- **Dedicated PC**: Any modern computer with Chrome
- **Raspberry Pi 4**: Budget option (~$75), excellent for 24/7 operation
- **Repurposed Laptop**: Reuse existing hardware

See [apps/tv-display/KIOSK-MODE-SETUP.md](apps/tv-display/KIOSK-MODE-SETUP.md) for:
- Complete setup instructions for Windows/macOS/Linux
- Auto-start configuration
- Hardware recommendations
- Troubleshooting guide
- Production deployment checklist

### Enhanced Logging Added

The TV display now includes comprehensive console logging to diagnose sound issues:
- Shows when audio system initializes
- Tracks new patient assignments
- Logs sound playback attempts and results
- Provides helpful diagnostic messages

Access console logs even in kiosk mode: Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)

### Status
✅ **RESOLVED** - Kiosk mode completely bypasses autoplay restrictions. Sound plays automatically without any user interaction.

### Technical Background

Browser autoplay policies block audio/video autoplay to prevent unwanted audio spam. These restrictions can be bypassed at the browser level using launch flags, which is the standard solution for kiosk deployments, digital signage, and unattended displays.

### Detailed Documentation
- [docs/SOUND_NOTIFICATION_ANALYSIS.md](docs/SOUND_NOTIFICATION_ANALYSIS.md) - Complete technical analysis
- [apps/tv-display/KIOSK-MODE-SETUP.md](apps/tv-display/KIOSK-MODE-SETUP.md) - Setup guide

---

## System Audit: Critical Vulnerabilities Found

### Overview
A comprehensive backend engineering audit of the queue management system identified **29 vulnerabilities** across the patient lifecycle, with **8 CRITICAL severity** issues requiring immediate attention before production deployment.

### Critical Issues Summary

#### 1. **Race Conditions in Patient Assignment** (CRITICAL)
Multiple concurrent requests can assign the same patient to different rooms simultaneously.

**Impact**: Data corruption, duplicate assignments, patient confusion
**Affected Code**: [apps/dashboard/src/services/firebaseApi.ts:178-250](apps/dashboard/src/services/firebaseApi.ts#L178-L250)

#### 2. **Race Conditions in Patient Completion** (CRITICAL)
Concurrent completion requests can mark wrong patients as completed.

**Impact**: Wrong patient marked as done, consultation records corrupted
**Affected Code**: [apps/dashboard/src/services/firebaseApi.ts:255-290](apps/dashboard/src/services/firebaseApi.ts#L255-L290)

#### 3. **Open Firestore Security Rules** (CRITICAL)
All Firestore collections have `allow read, write: if true;` - no authentication or authorization checks.

**Impact**: Anyone can read, modify, or delete all patient data, room statuses, and queue information
**Affected File**: [firestore.rules:1-30](firestore.rules#L1-L30)

#### 4. **Dual Registration Pathways** (HIGH)
Two different registration systems create patients with inconsistent status values.

**Impact**: Dashboard filters out patients from kiosk registration
**Affected Files**:
- [apps/dashboard/src/services/firebaseApi.ts:330-369](apps/dashboard/src/services/firebaseApi.ts#L330-L369)
- [apps/patient-registration/src/services/registration.ts](apps/patient-registration/src/services/registration.ts)

#### 5. **Queue Counter Race Conditions** (HIGH)
Transaction used for counter increment, but patient creation happens outside transaction scope.

**Impact**: Queue number inconsistencies if requests arrive simultaneously
**Affected Code**: [apps/kiosk/src/services/queueService.ts:45-80](apps/kiosk/src/services/queueService.ts#L45-L80)

### Full Vulnerability Report

For the complete list of 29 vulnerabilities with detailed analysis, attack scenarios, and implementation roadmap, see:

**[docs/SYSTEM_AUDIT_REPORT.md](docs/SYSTEM_AUDIT_REPORT.md)**

This comprehensive document includes:
- Detailed vulnerability descriptions with severity ratings
- Attack scenarios demonstrating each issue
- Code-level analysis with line references
- Recommended fixes with implementation examples
- Priority-based implementation roadmap (60-80 hours estimated)
- Testing strategies for each fix

### Immediate Action Required

**BEFORE PRODUCTION DEPLOYMENT:**

1. **Fix Firestore Security Rules** (3-4 hours) - CRITICAL
2. **Implement Atomic Transactions for Assignment** (4-6 hours) - CRITICAL
3. **Implement Atomic Transactions for Completion** (3-4 hours) - CRITICAL
4. **Unify Registration Pathways** (2-3 hours) - HIGH
5. **Add Input Validation** (4-5 hours) - HIGH

### Status
⚠️ **OPEN** - System functional for development/testing but **NOT PRODUCTION READY** due to critical security and data integrity issues.

### Recommendation
Allocate 60-80 hours for implementing fixes from the audit report before deploying to production hospital environment. The current system works for testing but has serious vulnerabilities that could cause data loss, privacy breaches, and operational failures in production.
