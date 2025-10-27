# Windows TV Display Kiosk Setup Guide

**Complete step-by-step guide for deploying the TV Display on Windows with automatic sound notifications.**

---

## 📋 Quick Start (5 Minutes)

### Step 1: Download the Launch Script

Copy `launch-kiosk.bat` to your Windows computer's Desktop.

### Step 2: Run the Script

**Double-click** `launch-kiosk.bat`

That's it! Chrome will open in full-screen kiosk mode with sound enabled.

---

## 🎯 What You Get

✅ **Full-screen TV display** - No browser UI visible
✅ **Automatic sound notifications** - Plays when patients assigned
✅ **No user interaction needed** - Truly automatic
✅ **Crash-resistant** - Auto-restarts cleanly
✅ **Production-ready** - Perfect for 24/7 operation

---

## 📖 Detailed Implementation Steps

### Step 1: Prepare the Computer

#### System Requirements

**Minimum:**
- Windows 10 or Windows 11
- 4GB RAM
- Dual-core processor
- Google Chrome installed

**Recommended:**
- Windows 10/11 Pro
- 8GB RAM
- Quad-core processor
- Wired Ethernet connection

#### Install Google Chrome

If Chrome is not installed:

1. Download: https://www.google.com/chrome/
2. Run installer
3. Complete installation
4. Close Chrome after first launch

### Step 2: Copy the Launch Script

#### Option A: From USB Drive

1. Copy `launch-kiosk.bat` to USB drive
2. Plug USB into Windows TV display computer
3. Copy `launch-kiosk.bat` to Desktop

#### Option B: Download from Repository

1. Open browser on Windows computer
2. Navigate to your repository
3. Download `apps/tv-display/launch-kiosk.bat`
4. Save to Desktop

#### Option C: Create Manually

1. Right-click Desktop → New → Text Document
2. Rename to `launch-kiosk.bat` (remove .txt extension)
3. Right-click → Edit
4. Paste the contents from the existing `launch-kiosk.bat` file
5. Save and close

### Step 3: Test the Launch Script

1. **Double-click** `launch-kiosk.bat` on Desktop
2. Chrome should open in full-screen mode
3. TV Display should load: https://geraldina-queue-manager-tv.web.app
4. You should see room statuses

**If Chrome doesn't open:**
- Check if Chrome is installed at: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Or: `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
- Edit `launch-kiosk.bat` and update the Chrome path if needed

### Step 4: Test Sound Notifications

1. **Keep TV display open** (kiosk mode)
2. On another computer (or same computer in a separate browser window):
   - Open: https://geraldina-queue-manager-receptionist.web.app
   - Login to dashboard
3. **Assign a patient to a room**
4. **Listen for sound** on TV display - should play automatically!

**If no sound:**
- Check Windows volume (system tray, bottom right)
- Ensure speakers/monitor audio is connected
- Right-click volume icon → Open Volume Mixer → Ensure Chrome not muted

### Step 5: Configure Auto-Start (Optional but Recommended)

Choose one of the methods below to make the TV display start automatically when Windows boots.

---

## 🚀 Auto-Start Configuration

### Method 1: Startup Folder (Easiest)

**Best for:** Simple setups, single user

**Steps:**

1. **Press** `Win + R` to open Run dialog

2. **Type:** `shell:startup` and press Enter
   - This opens: `C:\Users\[YourUsername]\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

3. **Copy** `launch-kiosk.bat` into this folder
   - Or create a shortcut to `launch-kiosk.bat`

4. **Restart computer** to test
   - TV display should launch automatically after login

**Pros:**
- ✅ Very easy to set up
- ✅ Easy to disable (just remove from folder)

**Cons:**
- ⚠️ Requires user to login first
- ⚠️ Only runs for specific user

---

### Method 2: Task Scheduler (Recommended for Production)

**Best for:** Production deployments, auto-login setups, 24/7 operation

**Steps:**

1. **Open Task Scheduler**
   - Press `Win + R`
   - Type: `taskschd.msc`
   - Press Enter

2. **Create New Task**
   - Click "Create Task" (not "Create Basic Task")
   - Name: `Hospital TV Display Kiosk`
   - Description: `Launches TV display in kiosk mode with automatic sound`

3. **General Tab:**
   - ✅ Check "Run whether user is logged on or not"
   - ✅ Check "Run with highest privileges"
   - ✅ Check "Hidden" (optional - hides console window)
   - Configure for: `Windows 10` or `Windows 11`

4. **Triggers Tab:**
   - Click "New..."
   - Begin the task: `At startup`
   - Delay task for: `30 seconds` (allows network to connect)
   - ✅ Check "Enabled"
   - Click OK

5. **Actions Tab:**
   - Click "New..."
   - Action: `Start a program`
   - Program/script: `C:\Users\[YourUsername]\Desktop\launch-kiosk.bat`
     - **Or full path to wherever you saved it**
   - Click OK

6. **Conditions Tab:**
   - ⬜ Uncheck "Start the task only if the computer is on AC power"
   - ⬜ Uncheck "Stop if the computer switches to battery power"

7. **Settings Tab:**
   - ✅ Check "Allow task to be run on demand"
   - ✅ Check "If the task fails, restart every: 1 minute"
   - ✅ Check "Attempt to restart up to: 3 times"
   - If running task doesn't end, force stop: `Enabled`

8. **Save the Task**
   - Click OK
   - Enter administrator password if prompted

9. **Test the Task**
   - Right-click the task → Run
   - TV display should launch
   - If it works, restart computer to test auto-start

**Pros:**
- ✅ Starts on system boot
- ✅ Runs even if no user logged in (with auto-login)
- ✅ Auto-restart on failure
- ✅ Most reliable for 24/7 operation

**Cons:**
- ⚠️ Slightly more complex setup
- ⚠️ Requires administrator privileges

---

### Method 3: Registry Run Key (Alternative)

**Best for:** Simple auto-start without Task Scheduler

**Steps:**

1. **Open Registry Editor**
   - Press `Win + R`
   - Type: `regedit`
   - Press Enter (administrator approval required)

2. **Navigate to:**
   ```
   HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
   ```

3. **Create New String Value**
   - Right-click in right pane → New → String Value
   - Name: `HospitalTVDisplay`
   - Double-click to edit
   - Value data: `C:\Users\[YourUsername]\Desktop\launch-kiosk.bat`
   - Click OK

4. **Restart to test**

**Pros:**
- ✅ Simple
- ✅ Runs on user login

**Cons:**
- ⚠️ Requires editing registry
- ⚠️ Needs user to login first

---

## 🔧 Windows-Specific Optimizations

### Disable Screen Sleep

**Why:** Prevent TV display from turning off

**Steps:**

1. Open **Settings** → **System** → **Power & sleep**
2. **Screen:** Set to `Never`
3. **Sleep:** Set to `Never`

### Disable Windows Updates During Operating Hours

**Why:** Prevent unexpected restarts

**Steps:**

1. Open **Settings** → **Update & Security** → **Windows Update**
2. Click **Advanced options**
3. **Active hours:** Set to match hospital operating hours
   - Example: 7:00 AM - 7:00 PM
4. This prevents automatic restarts during these hours

### Configure Auto-Login (Optional)

**Why:** TV display starts immediately on boot without manual login

**⚠️ Security Warning:** Only use on dedicated TV display computers in secure locations.

**Steps:**

1. Press `Win + R`
2. Type: `netplwiz`
3. Press Enter
4. Select your user account
5. ⬜ Uncheck "Users must enter a username and password to use this computer"
6. Click OK
7. Enter password (will be saved securely)
8. Restart to test

### Hide Mouse Cursor (Optional)

**Why:** Professional appearance for TV displays

**Solution 1: PowerToys (Recommended)**

1. Install Microsoft PowerToys: https://github.com/microsoft/PowerToys
2. Enable "Mouse Utilities"
3. Configure to hide cursor after inactivity

**Solution 2: Third-party Tool**

- Use "Auto Hide Mouse Cursor" or similar tool
- Many free options available

### Set Chrome as Default Browser (Optional)

**Why:** Ensures URLs open in Chrome

**Steps:**

1. Open **Settings** → **Apps** → **Default apps**
2. Click **Web browser**
3. Select **Google Chrome**

---

## 🔍 Troubleshooting

### Chrome Doesn't Open

**Problem:** Double-clicking `launch-kiosk.bat` does nothing or shows error.

**Solution 1:** Verify Chrome installation path

Open `launch-kiosk.bat` in Notepad and check these paths:
```batch
C:\Program Files\Google\Chrome\Application\chrome.exe
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
```

Find your Chrome installation:
1. Open File Explorer
2. Navigate to `C:\Program Files\Google\Chrome\Application\`
3. Or: `C:\Program Files (x86)\Google\Chrome\Application\`
4. Look for `chrome.exe`

**Solution 2:** Edit the batch file

1. Right-click `launch-kiosk.bat` → Edit
2. Update the Chrome path to match your installation
3. Save and try again

### Sound Doesn't Play

**Problem:** TV display loads but no sound on patient assignments.

**Check 1: Volume**
- Click volume icon (system tray, bottom right)
- Ensure volume is at 50-75%
- Ensure not muted

**Check 2: Volume Mixer**
- Right-click volume icon → Open Volume Mixer
- Ensure Chrome is not muted
- Ensure Chrome volume is up

**Check 3: Audio Output**
- Right-click volume icon → Open Sound settings
- Verify correct output device selected
- Test with "Test" button

**Check 4: Monitor/Speakers Connected**
- Verify HDMI cable connected (if using TV)
- Verify speakers plugged in and powered on
- Some monitors have separate audio input

**Check 5: Browser Console**
- On TV display, press `F12` (opens developer tools)
- Look for error messages
- Should see: "🔊 Attempting to play notification sound"

### TV Display Shows Blank or Error

**Problem:** Kiosk mode opens but page doesn't load.

**Check 1: Internet Connection**
- Ensure computer connected to internet
- Open another browser, test connection
- Try: https://www.google.com

**Check 2: URL Correct**
- Open `launch-kiosk.bat` in Notepad
- Verify URL is: `https://geraldina-queue-manager-tv.web.app`

**Check 3: Firebase Deployment**
- On another computer, open: https://geraldina-queue-manager-tv.web.app
- Verify it loads correctly

### Task Scheduler Doesn't Start

**Problem:** Auto-start configured but doesn't run on boot.

**Check 1: Task Settings**
- Open Task Scheduler
- Find "Hospital TV Display Kiosk"
- Check "Last Run Result" - should show success (0x0)

**Check 2: Run Manually**
- Right-click task → Run
- If works manually but not on boot, check trigger settings

**Check 3: Delay**
- Edit task → Triggers tab
- Ensure "Delay task for" is set to 30 seconds or more
- Network needs time to connect

**Check 4: Path**
- Edit task → Actions tab
- Verify batch file path is correct
- Use full absolute path (not relative)

### Chrome Crashes or Closes

**Problem:** Kiosk mode crashes or closes unexpectedly.

**Solution:** Task Scheduler auto-restart

Already configured in Method 2 (Task Scheduler):
- "If the task fails, restart every: 1 minute"
- "Attempt to restart up to: 3 times"

Chrome will automatically restart if it crashes.

### Multiple Chrome Windows Open

**Problem:** New Chrome window opens instead of replacing existing.

**Solution:** Close all Chrome instances first
1. Press `Ctrl + Shift + Esc` (Task Manager)
2. Find "Google Chrome" processes
3. End all Chrome tasks
4. Run `launch-kiosk.bat` again

---

## 📊 Production Deployment Checklist

Use this checklist for production TV display setup:

### Hardware Setup
- [ ] Windows 10/11 computer connected to TV
- [ ] HDMI cable connected
- [ ] Audio cable connected (if separate from HDMI)
- [ ] Ethernet cable connected (WiFi OK but wired preferred)
- [ ] Power cable connected
- [ ] Computer positioned securely

### Software Setup
- [ ] Google Chrome installed
- [ ] `launch-kiosk.bat` copied to Desktop
- [ ] Tested manually - TV display loads
- [ ] Tested sound - notification plays when patient assigned
- [ ] Auto-start configured (Startup Folder or Task Scheduler)
- [ ] Tested auto-start - restart computer, verify launches

### Windows Configuration
- [ ] Screen sleep disabled (set to Never)
- [ ] Computer sleep disabled (set to Never)
- [ ] Windows Update active hours configured
- [ ] Auto-login configured (optional, if in secure location)
- [ ] Volume set to 50-75%
- [ ] Default audio output device selected
- [ ] Chrome set as default browser (optional)

### Security & Access
- [ ] Computer in secure location (can't be tampered with)
- [ ] Mouse/keyboard removed or locked away (optional)
- [ ] Windows user account password set
- [ ] Administrator password known by IT staff

### Testing & Verification
- [ ] Restart computer - TV display launches automatically
- [ ] Assign test patient - sound plays
- [ ] Unplug/replug network - reconnects automatically
- [ ] Simulate power outage - recovers on boot
- [ ] Check after 24 hours - still running

### Documentation
- [ ] Computer name/ID documented
- [ ] Windows login credentials documented (secure location)
- [ ] WiFi/network credentials documented
- [ ] IT contact information posted nearby
- [ ] Troubleshooting guide accessible

---

## 🎯 Hardware Recommendations

### Budget Option: Refurbished Mini PC

**Example:** HP EliteDesk 800 G3 Mini (~$150 USD)
- Intel i5 processor
- 8GB RAM
- 256GB SSD
- Windows 10 Pro
- Small form factor (fits behind TV)

**Where to buy:** eBay, Amazon, local computer stores

### Mid-Range: Intel NUC

**Example:** Intel NUC 11 (~$400 USD)
- Intel i5 11th gen
- 8GB RAM
- 256GB NVMe SSD
- Windows 11 Pro
- Very small, silent, reliable

### Premium: Purpose-Built Digital Signage Player

**Example:** BrightSign, IAdea, ViewSonic (~$500-800 USD)
- Purpose-built for 24/7 operation
- Fanless (silent)
- Low power consumption
- Commercial warranty
- HTML5 support for web apps

### DIY Budget: Raspberry Pi with Windows IoT

**Not Recommended** - Raspberry Pi runs Linux better than Windows

Use Linux with the `launch-kiosk.sh` script instead.

---

## 📞 Support & Resources

### URLs

- **TV Display:** https://geraldina-queue-manager-tv.web.app
- **Dashboard:** https://geraldina-queue-manager-receptionist.web.app
- **Firebase Console:** https://console.firebase.google.com/project/geraldina-queue-manager

### Documentation

- [KIOSK-MODE-SETUP.md](KIOSK-MODE-SETUP.md) - General kiosk guide (all platforms)
- [MACOS-AUTOPLAY-SETUP.md](MACOS-AUTOPLAY-SETUP.md) - macOS-specific setup
- [../../docs/SOUND_NOTIFICATION_ANALYSIS.md](../../docs/SOUND_NOTIFICATION_ANALYSIS.md) - Technical analysis
- [../../ISSUES.md](../../ISSUES.md) - Known issues

### Getting Help

1. **Check Console Logs:** Press `F12` on TV display, look for errors
2. **Verify Network:** Ensure internet connection working
3. **Test URL:** Open TV display URL in normal browser first
4. **Check Volume:** System tray → Volume mixer → Chrome not muted

---

## 🚀 Quick Reference Card

**Print this and keep near TV display computer:**

```
═══════════════════════════════════════════════
   HOSPITAL TV DISPLAY - QUICK REFERENCE
═══════════════════════════════════════════════

🖥️  START TV DISPLAY
   Desktop → Double-click: launch-kiosk.bat

🔊 CHECK SOUND
   System tray → Volume icon → 50-75%

🔌 RESTART COMPUTER
   If frozen, press and hold power button 5 seconds

🆘 EMERGENCY CONTACT
   IT Support: [Your IT Phone Number]

📞 FIREBASE/CLOUD ISSUES
   Contact: [Your Developer Contact]

🌐 MANUAL ACCESS (if script fails)
   1. Open Google Chrome
   2. Go to: geraldina-queue-manager-tv.web.app
   3. Press F11 for full-screen

⌨️  EXIT KIOSK MODE
   Press: Alt + F4

═══════════════════════════════════════════════
```

---

**Last Updated:** 2025-10-27
**Tested On:** Windows 10, Windows 11
**Chrome Version:** 120+
**Status:** ✅ Production Ready
