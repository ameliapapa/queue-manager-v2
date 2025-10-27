# macOS Autoplay Configuration for TV Display

## The Issue

macOS Chrome has stricter autoplay policies than other platforms. Even with kiosk mode flags, autoplay may still be blocked depending on system settings.

## Solution: Chrome Site Settings

To guarantee autoplay works on macOS, you need to whitelist the TV display URL in Chrome's settings.

### Method 1: Chrome Settings UI

1. **Open Chrome normally** (not kiosk mode)

2. **Navigate to** the TV display:
   ```
   https://geraldina-queue-manager-tv.web.app
   ```

3. **Click the lock icon** in the address bar (left side)

4. **Click "Site Settings"**

5. **Find "Sound" setting**

6. **Change to "Allow"**

7. **Close Chrome completely** (`Cmd + Q`)

8. **Now launch kiosk mode** - autoplay should work!

---

### Method 2: Chrome Enterprise Policy (Advanced)

For production deployments, you can set enterprise policies that allow autoplay for specific sites.

**Create policy file:**
```bash
sudo mkdir -p /Library/Managed\ Preferences
sudo nano /Library/Managed\ Preferences/com.google.Chrome.plist
```

**Add this content:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>AutoplayAllowlist</key>
    <array>
        <string>https://geraldina-queue-manager-tv.web.app</string>
    </array>
</dict>
</plist>
```

**Apply:**
```bash
sudo chmod 644 /Library/Managed\ Preferences/com.google.Chrome.plist
```

**Restart Chrome** - the policy will be active.

---

### Method 3: Chrome Command Line Flag (Alternative)

Add these additional flags to the launch script:

```bash
--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies
--autoplay-policy=no-user-gesture-required
```

Already included in `launch-kiosk-isolated.sh`.

---

## Testing Autoplay

After configuring autoplay, test it:

1. **Launch kiosk mode:**
   ```bash
   ./launch-kiosk-isolated.sh
   ```

2. **Open console** (`Cmd + Option + I`)

3. **Assign a patient** from the dashboard

4. **Check console logs:**
   ```
   ✅ Sound played successfully  ← Autoplay working!
   ⚠️ Autoplay blocked           ← Still blocked, try Method 1 or 2
   ```

---

## Why This Is Necessary on macOS

macOS has system-level autoplay restrictions beyond just browser policies:

1. **System Integrity Protection (SIP)** - macOS security feature
2. **Gatekeeper** - Restricts unsigned applications
3. **Per-site permissions** - Chrome stores site-specific settings in user profile

The kiosk flag bypasses browser-level restrictions, but macOS-level restrictions require the site to be whitelisted.

---

## Production Deployment Recommendation

For hospital TV displays running 24/7:

**Hardware:** Use a Raspberry Pi 4 or Linux computer instead of macOS

**Why?**
- ✅ Linux respects `--autoplay-policy` flag immediately
- ✅ No additional system-level restrictions
- ✅ Cheaper hardware (~$75 for Raspberry Pi)
- ✅ More reliable for kiosk deployments
- ✅ Industry standard for digital signage

**Alternative:** If you must use macOS, follow Method 1 or 2 above to whitelist the site.

---

## Verification Commands

Check if Chrome is using the correct profile:
```bash
ps aux | grep chrome | grep autoplay
```

Should show: `--autoplay-policy=no-user-gesture-required`

Check if policy file exists:
```bash
ls -la /Library/Managed\ Preferences/com.google.Chrome.plist
```

---

## Summary

| Method | Ease | Persistence | Best For |
|--------|------|-------------|----------|
| Site Settings UI | ⭐⭐⭐ Easy | ✅ Permanent | Testing, single Mac |
| Enterprise Policy | ⭐⭐ Moderate | ✅ Permanent | Production Macs |
| Command Flags Only | ⭐⭐⭐ Easy | ⚠️ May not work on macOS | Linux/Windows |

**Recommended:** Use Method 1 (Site Settings UI) for immediate testing. For production, consider Linux hardware.

---

**Last Updated:** 2025-10-27
**Tested On:** macOS Sonoma 14.6
**Chrome Version:** 120+
