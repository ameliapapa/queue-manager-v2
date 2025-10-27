# Queue Manager Documentation

This folder contains all technical documentation for the Queue Manager system.

## 📚 Documentation Index

### System Architecture & Design
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture overview
- [API.md](API.md) - API documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide

### Deployment & Operations
- [DEPLOYMENT-SUCCESS.md](DEPLOYMENT-SUCCESS.md) - Automated cleanup deployment status and guide
- [DEPLOYMENT-STATUS.md](DEPLOYMENT-STATUS.md) - Historical deployment status (before Blaze upgrade)
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Quick reference for common operations
- [AUTOMATED-CLEANUP.md](AUTOMATED-CLEANUP.md) - Automated daily cleanup Cloud Function documentation

### Manual Cleanup Guides
- [README-CLEANUP.md](README-CLEANUP.md) - Manual cleanup overview
- [CLEANUP-INSTRUCTIONS.md](CLEANUP-INSTRUCTIONS.md) - Step-by-step manual cleanup instructions
- [CLEANUP-SUMMARY.md](CLEANUP-SUMMARY.md) - Cleanup system summary

### System Analysis & Audits
- [SYSTEM_AUDIT_REPORT.md](SYSTEM_AUDIT_REPORT.md) - Comprehensive security and vulnerability audit (29 vulnerabilities identified)
- [SOUND_NOTIFICATION_ANALYSIS.md](SOUND_NOTIFICATION_ANALYSIS.md) - TV display sound notification system analysis

### Other Documentation
- [PRINTER_SETUP.md](PRINTER_SETUP.md) - Receipt printer setup guide
- [PERFORMANCE_FIX_GUIDE.md](PERFORMANCE_FIX_GUIDE.md) - Performance optimization guide
- [CLAUDE_CODE_30_MIN_AUTONOMOUS_TASK.md](CLAUDE_CODE_30_MIN_AUTONOMOUS_TASK.md) - Claude Code autonomous task documentation

---

## 🚀 Quick Start

### For System Administrators
1. **Initial Setup**: Read [DEPLOYMENT.md](DEPLOYMENT.md)
2. **Daily Operations**: See [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
3. **Manual Cleanup**: Follow [README-CLEANUP.md](README-CLEANUP.md) if automation fails

### For Developers
1. **Architecture**: Start with [ARCHITECTURE.md](ARCHITECTURE.md)
2. **API Reference**: See [API.md](API.md)
3. **Security Audit**: Review [SYSTEM_AUDIT_REPORT.md](SYSTEM_AUDIT_REPORT.md) before making changes

### For Hospital Staff
1. **Sound Issues**: Check [SOUND_NOTIFICATION_ANALYSIS.md](SOUND_NOTIFICATION_ANALYSIS.md)
2. **Printer Setup**: Follow [PRINTER_SETUP.md](PRINTER_SETUP.md)
3. **Daily Cleanup**: Automatic - see [DEPLOYMENT-SUCCESS.md](DEPLOYMENT-SUCCESS.md)

---

## ⚠️ Critical Information

### Production Readiness
The system is **NOT PRODUCTION READY** for healthcare environments due to critical security vulnerabilities. See [SYSTEM_AUDIT_REPORT.md](SYSTEM_AUDIT_REPORT.md) for details.

**Must-fix before production:**
1. Firestore security rules (currently all open)
2. Race conditions in patient assignment/completion
3. Input validation
4. Dual registration pathway conflicts

### Automated Cleanup
✅ **DEPLOYED**: Automated cleanup runs nightly at midnight (America/New_York timezone)
- See [DEPLOYMENT-SUCCESS.md](DEPLOYMENT-SUCCESS.md) for status
- See [AUTOMATED-CLEANUP.md](AUTOMATED-CLEANUP.md) for technical details

---

## 📞 Support Resources

### Firebase Console Links
- **Functions**: https://console.firebase.google.com/project/geraldina-queue-manager/functions
- **Firestore**: https://console.firebase.google.com/project/geraldina-queue-manager/firestore
- **Usage & Billing**: https://console.firebase.google.com/project/geraldina-queue-manager/usage

### Application URLs
- **Dashboard**: https://geraldina-queue-manager-receptionist.web.app
- **Patient Registration**: https://geraldina-queue-manager-patient.web.app
- **Kiosk**: https://geraldina-queue-manager-kiosk.web.app
- **TV Display**: https://geraldina-queue-manager-tv.web.app

---

**Last Updated**: 2025-10-27
**Documentation Version**: 1.0.0
