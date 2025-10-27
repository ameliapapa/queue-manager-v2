"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsers = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const users = [
    // Reception staff
    { email: 'reception@geraldine.com', password: 'Reception123!', displayName: 'Reception Staff', role: 'reception' },
    // Doctors
    { email: 'doctor1@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Alban Kurti', role: 'doctor' },
    { email: 'doctor2@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Elira Hoxha', role: 'doctor' },
    { email: 'doctor3@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Fatmir Shehu', role: 'doctor' },
    { email: 'doctor4@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Gerta Rama', role: 'doctor' },
    { email: 'doctor5@geraldine.com', password: 'Doctor123!', displayName: 'Dr. Ilir Mema', role: 'doctor' }
];
exports.createUsers = functions.https.onRequest(async (req, res) => {
    const results = [];
    for (const user of users) {
        try {
            const userRecord = await admin.auth().createUser({
                email: user.email,
                password: user.password,
                displayName: user.displayName,
                emailVerified: true
            });
            await admin.auth().setCustomUserClaims(userRecord.uid, { role: user.role });
            await admin.firestore().collection('users').doc(userRecord.uid).set({
                email: user.email,
                displayName: user.displayName,
                role: user.role,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                active: true
            });
            results.push({ success: true, email: user.email, uid: userRecord.uid, role: user.role });
        }
        catch (error) {
            results.push({ success: false, email: user.email, error: error.message });
        }
    }
    res.json({ results, credentials: users });
});
//# sourceMappingURL=createDoctors.js.map