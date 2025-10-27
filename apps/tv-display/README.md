# TV Display - Queue Manager

Real-time TV display showing doctor room statuses and patient queue numbers.

## 🚀 Quick Start

### For TV Displays (Kiosk Mode - Recommended)

**Windows:**
```cmd
Double-click: launch-kiosk.bat
```
📖 **Windows Guide:** [WINDOWS-QUICKSTART.md](WINDOWS-QUICKSTART.md) (5-minute setup)
📖 **Complete Guide:** [WINDOWS-SETUP-GUIDE.md](WINDOWS-SETUP-GUIDE.md) (20+ pages)

**macOS:**
```bash
./launch-kiosk-isolated.sh
```
📖 **macOS Guide:** [MACOS-AUTOPLAY-SETUP.md](MACOS-AUTOPLAY-SETUP.md)

**Linux:**
```bash
./launch-kiosk.sh
```

**Result:**
- Full-screen display
- Sound notifications play automatically
- No user interaction required

### For Development

```bash
npm install
npm run dev
```

## 🔊 Sound Notifications

### Production Deployment (TV Displays)

Use kiosk mode to bypass browser autoplay restrictions:

✅ Sound plays automatically for all patient assignments
✅ No clicking required
✅ Full-screen mode
✅ Perfect for 24/7 operation

**See:** [KIOSK-MODE-SETUP.md](KIOSK-MODE-SETUP.md) for complete setup instructions.

### Development/Testing

Sound will work after first user interaction (click anywhere on page).

## 📁 Files

- `launch-kiosk.sh` - macOS/Linux kiosk launcher
- `launch-kiosk.bat` - Windows kiosk launcher
- `KIOSK-MODE-SETUP.md` - Complete kiosk setup guide
- `src/components/RoomStatus.tsx` - Main display component with sound notifications
- `public/sounds/notification.mp3` - Notification sound file

## 🖥️ Deployment

### URL
https://geraldina-queue-manager-tv.web.app

### Build
```bash
npm run build
```

### Deploy
```bash
firebase deploy --only hosting:geraldina-queue-manager-tv
```

## 🔧 Features

- Real-time room status updates
- Patient queue number display
- Visual pulsing animation for new assignments
- Sound notifications (in kiosk mode)
- Albanian language labels
- Hospital branding
- Responsive 2-column grid layout

## 📖 Documentation

- [KIOSK-MODE-SETUP.md](KIOSK-MODE-SETUP.md) - Complete kiosk setup guide
- [../../docs/SOUND_NOTIFICATION_ANALYSIS.md](../../docs/SOUND_NOTIFICATION_ANALYSIS.md) - Technical sound analysis
- [../../ISSUES.md](../../ISSUES.md) - Known issues and solutions

## 🎯 Hardware Recommendations

- **Dedicated PC**: Any modern computer with Chrome
- **Raspberry Pi 4**: Budget option (~$75), excellent for TV displays
- **Old Laptop**: Repurpose existing hardware

See [KIOSK-MODE-SETUP.md](KIOSK-MODE-SETUP.md) for detailed hardware recommendations.

## ⚙️ Configuration

No configuration required - the display automatically connects to Firebase and shows real-time updates.

## 🆘 Troubleshooting

### Sound Not Playing?

**Solution:** Use kiosk mode launch scripts. Browser autoplay policies block sound in regular browser mode.

See [KIOSK-MODE-SETUP.md](KIOSK-MODE-SETUP.md) for complete troubleshooting guide.

### Check Console Logs

Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open developer console.

Look for diagnostic messages:
- `🔊 Audio system initialized`
- `🆕 NEW patient assignment detected!`
- `✅ Sound played successfully`

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-10-27
