import QRCode from 'qrcode';

/**
 * Generate a QR code as a data URL
 * @param data - The data to encode in the QR code
 * @param size - The size of the QR code in pixels (default: 200)
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateQRCode(
  data: string,
  size: number = 200
): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrCodeDataUrl;
  } catch (error) {
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
export async function generateQRCodeBuffer(
  data: string,
  size: number = 200
): Promise<Buffer> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return qrCodeBuffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code buffer');
  }
}
