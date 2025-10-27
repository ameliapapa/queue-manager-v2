# Windows TV Display - Quick Start Guide

**Get your TV Display running with automatic sound in under 5 minutes.**

---

## ⚡ 5-Minute Setup

### Step 1: Download Files (1 minute)

Copy these two files to your Windows computer's **Desktop**:

1. `launch-kiosk.bat` - Main launcher
2. `setup-windows-autostart.bat` - Auto-start helper (optional)

### Step 2: Test It (2 minutes)

**Double-click** `launch-kiosk.bat` on Desktop

**Expected result:**
- Chrome opens in full-screen
- TV Display loads
- Shows room statuses

**If Chrome doesn't open:**
- Install Chrome: https://www.google.com/chrome/
- Try again

### Step 3: Test Sound (2 minutes)

1. **Keep TV Display open** in kiosk mode

2. **On another computer** (or separate browser window):
   - Go to: https://geraldina-queue-manager-receptionist.web.app
   - Login to dashboard

3. **Assign a patient to a room**

4. **Listen** - sound should play automatically on TV display!

**If no sound:**
- Check volume (system tray icon, bottom right)
- Ensure not muted
- Check speakers/monitor connected

---

## ✅ You're Done!

The TV Display is now working. Sound plays automatically when patients are assigned.

---

## 🚀 Optional: Auto-Start on Boot

Want the TV Display to start automatically when Windows boots?

### Option A: Simple (Requires Login)

1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter
4. Copy `launch-kiosk.bat` into this folder
5. Restart computer to test

**Done!** TV Display now starts automatically when you login.

### Option B: Use Helper Script

1. **Double-click** `setup-windows-autostart.bat`
2. Choose option **[1]** for simple setup
3. Follow on-screen instructions

---

## 🔧 Common Issues

### Chrome Doesn't Open

**Fix:** Check Chrome is installed at:
- `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Or: `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`

If different location, edit `launch-kiosk.bat` and update path.

### No Sound

**Fix 1:** Check volume
- Click volume icon (system tray)
- Ensure 50-75% volume
- Ensure not muted

**Fix 2:** Check Volume Mixer
- Right-click volume icon → Open Volume Mixer
- Ensure Chrome not muted

**Fix 3:** Check audio output
- Right-click volume icon → Open Sound settings
- Verify correct device selected

### TV Display Blank

**Fix:** Check internet connection
- Open another browser
- Test: https://www.google.com
- If no internet, connect Ethernet or WiFi

---

## ⌨️ Exit Kiosk Mode

Press **`Alt + F4`** to close Chrome and exit kiosk mode.

---

## 📖 Need More Help?

See the complete guide: **[WINDOWS-SETUP-GUIDE.md](WINDOWS-SETUP-GUIDE.md)**

Includes:
- Detailed troubleshooting
- Advanced auto-start configuration (Task Scheduler)
- Windows optimizations
- Production deployment checklist
- Hardware recommendations

---

## 📞 Quick Reference

| Action | How |
|--------|-----|
| Start TV Display | Double-click `launch-kiosk.bat` |
| Check Volume | System tray → Volume icon |
| Exit Kiosk Mode | Press `Alt + F4` |
| Auto-start Setup | Run `setup-windows-autostart.bat` |
| Check Console Logs | Press `F12` in kiosk window |
| Restart Computer | Hold power button 5 seconds |

---

## 🎯 Next Steps

1. ✅ TV Display running - **You're done for basic usage**
2. 🔄 Configure auto-start - **Optional but recommended**
3. 📋 Production checklist - **See WINDOWS-SETUP-GUIDE.md**

---

**Status:** ✅ Production Ready
**Last Updated:** 2025-10-27
**Estimated Setup Time:** 5 minutes
