"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRCode = generateQRCode;
exports.generateQRCodeBuffer = generateQRCodeBuffer;
const qrcode_1 = __importDefault(require("qrcode"));
/**
 * Generate a QR code as a data URL
 * @param data - The data to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
async function generateQRCode(data, size = 200) {
    try {
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(data, {
            width: size,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });
        return qrCodeDataUrl;
    }
    catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
}
/**
 * Generate a QR code as a buffer (for printing)
 * @param data - The data to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 200)
 * @returns Promise<Buffer> - PNG buffer of the QR code image
 */
async function generateQRCodeBuffer(data, size = 200) {
    try {
        const qrCodeBuffer = await qrcode_1.default.toBuffer(data, {
            width: size,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
            errorCorrectionLevel: 'M',
        });
        return qrCodeBuffer;
    }
    catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code buffer');
    }
}
//# sourceMappingURL=qrGenerator.js.map