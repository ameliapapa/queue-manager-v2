# 30-Minute Claude Code Autonomous Performance Debugging Task

**IMPORTANT: Copy everything below and paste into Claude Code**

---

You are debugging a hospital queue management system for performance issues. You have 30 minutes to work autonomously. Here's your complete task list.

## Your Mission

Optimize the hospital dashboard's performance by identifying and fixing the slowness in the "Assign Next" button and overall system. Work through these tasks in order, spending roughly 5 minutes per task.

---

## TASK 1: Analyze DashboardContext (5 minutes)

**Objective:** Find and document the polling loop issue

```bash
# Action 1: Read the DashboardContext file
Read: apps/dashboard/src/contexts/DashboardContext.tsx

# Action 2: Identify issues
Look for:
- Any setInterval or setTimeout that runs frequently
- Firestore onSnapshot listeners that aren't cleaned up
- useEffect hooks without proper dependency arrays
- Duplicate listeners on the same collections

# Action 3: Document findings
Create a summary of:
- How many listeners exist
- Are they being created multiple times?
- What's causing the "Stopping midnightResetService" console spam?
- Any memory leaks?

# Action 4: Show me the problematic code sections
Highlight the top 3 issues you find
```

---

## TASK 2: Fix the Polling Loop (5 minutes)

**Objective:** Remove polling that runs too frequently

```bash
# Action 1: Modify DashboardContext.tsx
Fix these patterns:

PATTERN 1 - useEffect without dependencies (runs on every render):
❌ useEffect(() => { listener setup })
✅ useEffect(() => { listener setup }, [])

PATTERN 2 - setInterval in useEffect without cleanup:
❌ useEffect(() => { setInterval(...) })
✅ useEffect(() => { 
    const interval = setInterval(...)
    return () => clearInterval(interval)
  }, [])

PATTERN 3 - Multiple listeners on same collection:
❌ Multiple onSnapshot calls on 'patients'
✅ Single onSnapshot call with proper cleanup

# Action 2: Apply fixes
- Add missing dependency arrays
- Add cleanup functions (unsubscribe for listeners)
- Remove duplicate listeners
- Keep only ONE listener per collection

# Action 3: Test the changes
After modifying:
- Check that "Stopping midnightResetService" appears ONCE at startup
- NOT repeated every second
- No console warnings about multiple listeners
```

---

## TASK 3: Optimize Firestore Queries (5 minutes)

**Objective:** Speed up database queries with filters and limits

```bash
# Action 1: Find all Firestore queries in your services
Search in: apps/dashboard/src/services/

Look for patterns like:
- collection(db, 'patients')
- getDocs(q)
- onSnapshot(q)

# Action 2: For each query, optimize it:

Current pattern (SLOW):
const q = query(collection(db, 'patients'));
const snapshot = await getDocs(q);
// Then filter in JavaScript

Better pattern (FAST):
const q = query(
  collection(db, 'patients'),
  where('status', '==', 'registered'),
  orderBy('createdAt', 'desc'),
  limit(100)
);

# Action 3: Apply to all queries:
- Add where() clauses to filter before fetching
- Add limit() to prevent fetching thousands
- Add orderBy() for efficient sorting
- Use select() to get only needed fields

# Action 4: Document improvements:
Show before/after for top 3 queries
Expected: 10x faster query execution
```

---

## TASK 4: Fix Console Errors (5 minutes)

**Objective:** Remove null timestamp errors and clean up logs

```bash
# Action 1: Find RegisteredQueueList.tsx or similar
Search: apps/dashboard/src/components/

Look for:
- formatDistanceToNow() calls
- format() calls
- Any date formatting on patient data

# Action 2: Add null checks:
Current (crashes):
<p>{formatDistanceToNow(patient.registeredAt)}</p>

Fixed (safe):
<p>{patient.registeredAt ? formatDistanceToNow(patient.registeredAt) : 'N/A'}</p>

# Action 3: Create a safe date formatter utility:
File: apps/dashboard/src/utils/dateUtils.ts

Function should:
- Accept: Date | null | undefined
- Return: Formatted string or 'N/A'
- Handle all edge cases

# Action 4: Replace all direct date formatting:
- Use the new safe formatter everywhere
- No more "Invalid time value" errors
- Console should be clean

# Action 5: Remove console.log spam:
- Find console.log calls in listeners
- Remove or wrap with: if (import.meta.env.DEV)
- Keep only console.error for actual errors
```

---

## TASK 5: Optimize the "Assign Next" Function (5 minutes)

**Objective:** Make the button click instant

```bash
# Action 1: Find the assignNext function
Search in: apps/dashboard/src/services/
Look for: assignNext, assignPatient, or similar

# Action 2: Analyze current implementation:
Questions to answer:
- How many database queries does it make?
- Are queries run sequentially or in parallel?
- Is it using batch writes?
- Any N+1 query patterns?

# Action 3: Optimize the function:
Current pattern (SLOW):
1. Get all registered patients
2. Filter in app to find first one
3. Query for available rooms
4. Update patient document
5. Update room document
(5 separate database calls)

Better pattern (FAST):
1. Query: WHERE status='registered' LIMIT 1 (gets one document)
2. Query: WHERE status='available' LIMIT 1 (gets one room)
3. Batch write: Update both in one operation
(3 operations, much faster)

# Action 4: Apply optimizations:
- Add filters to queries
- Use batch writes or transactions
- Combine queries where possible
- Add error handling
- Return immediately instead of waiting

# Action 5: Expected result:
- Function completes in <500ms instead of 5+ seconds
- Fewer database operations
- Better error messages
```

---

## TASK 6: Check Component Re-Renders (5 minutes)

**Objective:** Prevent unnecessary re-renders that slow everything down

```bash
# Action 1: Review DashboardContext again:
Look for:
- How is state structured?
- Does updating patients re-render everything?
- Do rooms and patients updates trigger each other?

# Action 2: Check useCallback and useMemo:
Are functions wrapped with useCallback?
Are derived values wrapped with useMemo?

Pattern (SLOW):
const handleAssign = (patient) => { ... } // Recreated on every render

Pattern (FAST):
const handleAssign = useCallback((patient) => { ... }, []) // Cached

# Action 3: Split state if needed:
Instead of:
const [state, setState] = useState({ patients, rooms, stats })

Better:
const [patients, setPatients] = useState([])
const [rooms, setRooms] = useState([])
const [stats, setStats] = useState({})

Reason: Only components that need patients re-render when patients change

# Action 4: Add React.memo to components:
File: apps/dashboard/src/components/

Add to:
- PatientRow
- RoomCard
- PatientList
- Any frequently-rendering components

Pattern:
export const PatientRow = React.memo(function PatientRow({ patient }) {
  return ...
})

# Action 5: Measure improvement:
After changes:
- DashboardContext should stabilize (stop changing frequently)
- Components should re-render less often
- UI should feel more responsive
```

---

## TASK 7: Firestore Indexes (Time Permitting - 2-3 minutes)

**Objective:** Add database indexes for fast queries

```bash
# Action 1: Check firestore.indexes.json
File: firestore.indexes.json

# Action 2: Add these indexes (if not present):
1. Collection: patients
   Fields: status (Asc), createdAt (Desc)
   
2. Collection: patients
   Fields: status (Asc), queueNumber (Asc)
   
3. Collection: patients
   Fields: assignedRoomId (Asc), assignedAt (Desc)
   
4. Collection: rooms
   Fields: status (Asc), roomNumber (Asc)

# Action 3: Document what was added:
Show the new indexes in JSON format

# Action 4: Instructions for deployment:
Tell the user to run:
firebase deploy --only firestore:indexes

Note: Indexes take 5-10 minutes to build in Firebase
```

---

## TASK 8: Generate Performance Report (Time Permitting - 2-3 minutes)

**Objective:** Summarize all changes made

```bash
# Action 1: Create a performance report

Include:
1. Issues Found:
   - Polling loop running 50x per second
   - WebSocket reconnecting repeatedly
   - Queries without filters
   - No database indexes
   - N+1 query patterns
   - Too many re-renders

2. Fixes Applied:
   - Fixed useEffect dependency arrays
   - Removed duplicate listeners
   - Added query filters and limits
   - Fixed null timestamp errors
   - Optimized assignNext function
   - Added React.memo and useCallback
   - Suggested database indexes

3. Expected Performance Improvements:
   - Overall latency: 10-100x faster
   - Database queries: 10x faster
   - Bandwidth: 20x less
   - Button response: <500ms instant
   - CPU usage: 5-10x lower
   - Memory: 50% reduction

4. Files Modified:
   - apps/dashboard/src/contexts/DashboardContext.tsx
   - apps/dashboard/src/services/* (query files)
   - apps/dashboard/src/components/* (re-render fixes)
   - apps/dashboard/src/utils/dateUtils.ts (new)
   - firestore.indexes.json (added indexes)

5. Next Steps:
   - Deploy indexes
   - Test in development
   - Measure improvements in DevTools
   - Deploy to production
   - Monitor performance
```

---

## IMPORTANT NOTES

1. **Work Autonomously**: Make all changes yourself without asking for confirmation
2. **Show Your Work**: After each task, show what you found and what you fixed
3. **Be Thorough**: Check for edge cases and error handling
4. **Prioritize Impact**: Focus on high-impact changes first
5. **Document Changes**: Keep a running list of what you've modified
6. **Test Logic**: Verify changes make sense before applying them

---

## Files to Modify (In Priority Order)

1. `apps/dashboard/src/contexts/DashboardContext.tsx` (CRITICAL)
2. `apps/dashboard/src/services/*.ts` (query files) (HIGH)
3. `apps/dashboard/src/components/*.tsx` (rendering) (HIGH)
4. `apps/dashboard/src/utils/dateUtils.ts` (NEW FILE)
5. `firestore.indexes.json` (MEDIUM)

---

## Success Criteria

After 30 minutes of work, you should have:

✅ Identified root causes of slowness
✅ Fixed polling loop
✅ Optimized at least 3 Firestore queries
✅ Fixed console errors
✅ Optimized assignNext function
✅ Fixed re-render issues
✅ Suggested database indexes
✅ Created performance report
✅ Made DashboardContext stable (no more spam)
✅ "Assign Next" button ready to be instant

---

## Expected Time Breakdown

- Task 1 (Analyze): 5 min
- Task 2 (Fix polling): 5 min
- Task 3 (Optimize queries): 5 min
- Task 4 (Fix console): 5 min
- Task 5 (Assign Next): 5 min
- Task 6 (Re-renders): 5 min
- Task 7-8 (Indexes + Report): 3 min
- **Total: ~30 minutes** ✅

---

## How to Run This

1. Copy all text above
2. Paste into Claude Code chat
3. Let Claude work for 30 minutes
4. Review the results
5. Ask for any clarifications
6. Deploy the changes

---

**GO! Start with TASK 1 and work through the list. You have 30 minutes. Document everything you find and fix. Good luck!** 🚀

---

## After This Task Completes

When you finish, I (the user) will:
1. Review all your changes
2. Test in development
3. Verify performance improvements
4. Merge to main branch
5. Deploy to Firebase

Your job: Make the system 10-100x faster in 30 minutes. ⚡

Good luck, Claude! 💪
