# TV Display Kiosk Mode Setup

**Purpose**: Run the TV Display in full-screen kiosk mode with automatic sound notifications enabled.

**Status**: ✅ Production Ready

---

## Quick Start

### Windows
1. Double-click `launch-kiosk.bat`
2. Chrome will open in full-screen kiosk mode
3. Sound notifications will play automatically

### macOS / Linux
1. Open Terminal
2. Navigate to this directory: `cd apps/tv-display`
3. Run: `./launch-kiosk.sh`
4. Chrome will open in full-screen kiosk mode
5. Sound notifications will play automatically

### Exit Kiosk Mode
- **Windows/Linux**: Press `Alt + F4`
- **macOS**: Press `Cmd + Q`

---

## What is Kiosk Mode?

Kiosk mode is a special browser mode designed for:
- Public displays
- Digital signage
- Information kiosks
- Unattended devices

**Features**:
- ✅ Full-screen display (no browser chrome)
- ✅ Autoplay sound enabled
- ✅ No address bar or tabs
- ✅ No popup dialogs
- ✅ No session restore prompts
- ✅ Automatically restarts on crash

---

## Browser Launch Flags Explained

The kiosk scripts use these Chrome/Chromium flags:

| Flag | Purpose |
|------|---------|
| `--kiosk` | Full-screen mode, hides all browser UI |
| `--autoplay-policy=no-user-gesture-required` | **Bypasses autoplay restrictions** |
| `--disable-infobars` | Hides "Chrome is being controlled" message |
| `--disable-session-crashed-bubble` | No crash recovery prompts |
| `--disable-restore-session-state` | Fresh start every time |
| `--start-fullscreen` | Ensures full-screen on launch |
| `--noerrdialogs` | Suppresses error popups |
| `--no-first-run` | Skips first-run setup |

**Key Flag**: `--autoplay-policy=no-user-gesture-required` allows sound to play without user interaction.

---

## Deployment Scenarios

### Scenario 1: Dedicated TV Display Computer

**Hardware**:
- Small PC connected to TV (Intel NUC, Raspberry Pi 4, or similar)
- HDMI connection to TV
- Keyboard/mouse for initial setup only

**Setup**:
1. Install Chrome/Chromium
2. Copy launch script to desktop
3. Configure to run on startup (see Auto-Start section below)
4. Hide mouse cursor (optional)

**Pros**:
- Reliable, dedicated hardware
- Always on, always displaying
- Sound works automatically

**Cons**:
- Requires dedicated hardware
- Small upfront cost

---

### Scenario 2: Repurposed Laptop/Tablet

**Hardware**:
- Old laptop or tablet
- Connect to TV via HDMI (optional)

**Setup**:
1. Disable sleep/screen saver
2. Run launch script on boot
3. Close lid (if laptop) - configure to keep running

**Pros**:
- Reuses existing hardware
- Portable

**Cons**:
- May overheat if not ventilated
- Battery degradation if always plugged in

---

### Scenario 3: Raspberry Pi (Budget Option)

**Hardware**:
- Raspberry Pi 4 (4GB RAM recommended)
- Power supply + HDMI cable
- MicroSD card with Raspberry Pi OS

**Cost**: ~$75 USD

**Setup**:
```bash
# Install Chromium (usually pre-installed)
sudo apt-get update
sudo apt-get install chromium-browser

# Copy launch script
cd ~/Desktop
wget https://raw.githubusercontent.com/.../launch-kiosk.sh
chmod +x launch-kiosk.sh

# Configure auto-start (see below)
```

**Pros**:
- Low cost
- Low power consumption
- Reliable for 24/7 operation

**Cons**:
- Initial setup required
- Slightly slower than full PC

---

## Auto-Start Configuration

### Windows - Run on Startup

**Method 1: Startup Folder** (Easiest)
1. Press `Win + R`
2. Type: `shell:startup`
3. Copy `launch-kiosk.bat` to this folder
4. Restart computer

**Method 2: Task Scheduler** (More reliable)
1. Open Task Scheduler
2. Create Basic Task → "TV Display Kiosk"
3. Trigger: "When computer starts"
4. Action: Start a program → Select `launch-kiosk.bat`
5. Settings:
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
   - Delay: 30 seconds (allow network to connect)

---

### macOS - Run on Login

**Method 1: Login Items**
1. System Preferences → Users & Groups → Login Items
2. Click `+` → Add `launch-kiosk.sh`
3. ✅ Check "Hide"

**Method 2: LaunchAgent** (More reliable)
Create file: `~/Library/LaunchAgents/com.hospital.tvdisplay.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hospital.tvdisplay</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/apps/tv-display/launch-kiosk.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load: `launchctl load ~/Library/LaunchAgents/com.hospital.tvdisplay.plist`

---

### Linux - Run on Boot

**Method 1: Desktop Autostart**
Create file: `~/.config/autostart/tv-display.desktop`

```ini
[Desktop Entry]
Type=Application
Name=TV Display Kiosk
Exec=/path/to/apps/tv-display/launch-kiosk.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
```

**Method 2: Systemd Service** (Headless, no desktop)
Create file: `/etc/systemd/system/tv-display.service`

```ini
[Unit]
Description=Hospital TV Display Kiosk
After=network.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
ExecStart=/home/pi/apps/tv-display/launch-kiosk.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable tv-display.service
sudo systemctl start tv-display.service
```

---

## Additional Kiosk Hardening

### Hide Mouse Cursor (Linux/Raspberry Pi)
```bash
# Install unclutter
sudo apt-get install unclutter

# Add to autostart
unclutter -idle 0.1 -root &
```

### Disable Screen Saver (Windows)
```
Control Panel → Power Options → Screen → Never
Control Panel → Personalization → Screen Saver → None
```

### Disable Screen Saver (Linux)
```bash
# GNOME
gsettings set org.gnome.desktop.session idle-delay 0

# XFCE
xset s off
xset -dpms
```

### Prevent Sleep (macOS)
```bash
sudo pmset -a sleep 0
sudo pmset -a displaysleep 0
```

---

## Troubleshooting

### Sound Still Not Playing

**Check 1**: Verify volume is not muted
- Windows: System tray volume icon
- macOS: Menu bar volume icon
- Linux: `alsamixer` command

**Check 2**: Test sound file directly
```bash
# macOS
afplay /path/to/notification.mp3

# Linux
aplay /path/to/notification.mp3

# Windows
Start-Process /path/to/notification.mp3
```

**Check 3**: Browser console logs
Even in kiosk mode, you can access console:
- Press `Ctrl + Shift + I` (Windows/Linux)
- Press `Cmd + Option + I` (macOS)
- Look for sound-related messages

---

### Chrome Doesn't Start in Kiosk Mode

**Issue**: Wrong Chrome path

**Fix**: Find your Chrome installation
```bash
# macOS
which google-chrome

# Linux
which chromium-browser
which google-chrome

# Windows (PowerShell)
Get-ChildItem "C:\Program Files" -Recurse -Filter "chrome.exe"
```

Update the path in the launch script.

---

### Kiosk Keeps Showing "Restore Session" Prompt

**Solution**: Add these flags to launch script:
```bash
--disable-restore-session-state
--disable-session-crashed-bubble
--no-first-run
```

These are already included in the provided scripts.

---

### Display Goes to Sleep

**Windows**:
```
Control Panel → Power & Sleep → Screen: Never
```

**macOS**:
```
System Preferences → Energy Saver → Display sleep: Never
```

**Linux**:
```bash
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

---

## Testing the Setup

1. **Launch kiosk mode** using the script
2. **Verify full-screen**: No browser UI visible
3. **Test sound**: Assign a patient from dashboard
4. **Listen**: Sound should play automatically (no click needed)
5. **Check console**: Look for logs like:
   ```
   🔊 Audio system initialized
   🆕 NEW patient assignment detected!
   ✅ Sound played successfully
   ```

---

## Production Deployment Checklist

- [ ] Chrome/Chromium installed
- [ ] Launch script copied and made executable
- [ ] Launch script runs on startup/boot
- [ ] Screen sleep disabled
- [ ] Computer sleep disabled
- [ ] Volume at appropriate level (50-75%)
- [ ] Mouse cursor hidden (optional)
- [ ] Network connection stable
- [ ] TV display URL accessible: https://geraldina-queue-manager-tv.web.app
- [ ] Sound test: Assign patient, verify notification plays
- [ ] Auto-restart on crash configured (optional)

---

## Hardware Recommendations

### Minimum Specs
- **CPU**: Dual-core 1.5GHz
- **RAM**: 2GB
- **Storage**: 8GB
- **Network**: WiFi or Ethernet

### Recommended Specs (Smooth performance)
- **CPU**: Quad-core 2.0GHz (Intel i3 or equivalent)
- **RAM**: 4GB
- **Storage**: 16GB SSD
- **Network**: Wired Ethernet (more reliable)

### Budget Option: Raspberry Pi 4
- **Model**: Raspberry Pi 4B (4GB RAM)
- **Cost**: ~$75 USD complete kit
- **Performance**: Excellent for TV displays
- **Setup**: Install Raspberry Pi OS Lite, use launch script

---

## Security Considerations

Kiosk mode browsers are **more permissive** to enable unattended operation:

1. **Autoplay enabled**: Any website can play sound
2. **No session isolation**: Same profile between restarts
3. **No safety prompts**: Crash recovery disabled

**Recommendation**:
- Only navigate to trusted URLs (your TV display)
- Use dedicated device for kiosk mode only
- Don't browse other websites on the same device
- Lock physical access to the device

---

## Support

### Related Documentation
- [SOUND_NOTIFICATION_ANALYSIS.md](../../docs/SOUND_NOTIFICATION_ANALYSIS.md) - Technical analysis
- [ISSUES.md](../../ISSUES.md) - Known issues

### URLs
- **TV Display**: https://geraldina-queue-manager-tv.web.app
- **Dashboard**: https://geraldina-queue-manager-receptionist.web.app

### Need Help?
Check console logs (Ctrl+Shift+I even in kiosk mode) for diagnostic information.

---

**Last Updated**: 2025-10-27
**Version**: 1.0.0
**Status**: ✅ Production Ready
