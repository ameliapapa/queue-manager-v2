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

### Future Consideration
Consider deploying Firebase Cloud Functions for automatic daily cleanup to prevent accumulation of old patient records.

---

## Ongoing Issue: Sound Notifications on TV Display

### Problem
Notification sound should play automatically on the TV display when a patient is newly assigned to a room, but it doesn't work consistently.

### Root Cause
**Browser autoplay policies**: Modern browsers (Chrome, Firefox, Safari) block autoplay of audio/video without user interaction. This is a security and user experience feature that cannot be bypassed.

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

### Status
⚠️ **PARTIALLY RESOLVED** - Sound works after first user interaction, but cannot play automatically on page load due to browser restrictions.

### Possible Future Solutions

#### Option 1: User Prompt Overlay (Recommended)
Add an initial overlay on the TV display that says "Click to Enable Sound" which requires one user interaction to unlock audio.

**Pros:**
- Works within browser policies
- Clear user experience
- Reliable solution

**Cons:**
- Requires manual interaction once per page load

#### Option 2: Web Audio API with AudioContext
Use Web Audio API instead of HTML5 Audio element.

**Pros:**
- More powerful audio control
- Better performance for complex audio

**Cons:**
- Still requires user interaction to unlock
- More complex implementation
- Same fundamental limitation

#### Option 3: Visual-Only Notifications
Accept the browser limitation and rely on visual cues (pulsing animation) for notifications.

**Pros:**
- Already implemented and working
- No browser restrictions
- No user interaction needed

**Cons:**
- Less attention-grabbing than sound
- May be missed in busy environment

### Technical Background

#### Browser Autoplay Policies
All modern browsers implement autoplay restrictions:
- **Chrome**: Autoplay blocked unless user has interacted with the domain
- **Firefox**: Autoplay blocked by default
- **Safari**: Strict autoplay policy, requires user interaction

These policies are designed to:
- Prevent unwanted audio spam
- Improve user experience
- Reduce bandwidth usage
- Enhance accessibility

Reference: [Chrome Autoplay Policy](https://developer.chrome.com/blog/autoplay/)

### Recommendation
Implement **Option 1** with a simple overlay that requires one click/tap to enable sound when the TV display first loads. This is the most reliable and user-friendly solution that works within browser security policies.
