/**
 * Mock service for development/testing without Firebase emulators
 * This simulates Cloud Functions for local testing
 */

interface MockQueueNumberResult {
  success: boolean;
  queueNumber: number;
  patientId: string;
  registrationUrl: string;
}

interface MockPrintTicketResult {
  success: boolean;
  ticketHtml: string;
  qrCodeDataUrl: string;
  printJobId: string;
  timestamp: string;
}

// Simulate queue counter
let currentQueueNumber = 0;

/**
 * Mock queue number generation (simulates Cloud Function)
 */
export async function mockGenerateQueueNumber(): Promise<MockQueueNumberResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  currentQueueNumber++;

  const patientId = `mock-patient-${currentQueueNumber}-${Date.now()}`;
  const registrationUrl = `http://localhost:3002?q=${currentQueueNumber}`;

  return {
    success: true,
    queueNumber: currentQueueNumber,
    patientId,
    registrationUrl,
  };
}

/**
 * Mock print ticket generation (simulates Cloud Function)
 */
export async function mockGeneratePrintTicket(
  queueNumber: number,
  registrationUrl: string
): Promise<MockPrintTicketResult> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate a simple QR code data URL (mock)
  const qrCodeDataUrl = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="white"/>
      <rect x="40" y="40" width="120" height="120" fill="black"/>
      <text x="100" y="105" text-anchor="middle" fill="white" font-size="20">${String(queueNumber).padStart(3, '0')}</text>
    </svg>
  `)}`;

  const timestamp = new Date().toLocaleString();

  const ticketHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: 80mm 120mm; margin: 5mm; }
    body {
      font-family: Arial, sans-serif;
      width: 80mm;
      padding: 5mm;
      background: white;
    }
    .ticket {
      text-align: center;
      border: 2px solid #000;
      padding: 10px;
    }
    .header {
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .hospital-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .timestamp { font-size: 10px; color: #666; }
    .queue-section { margin: 20px 0; }
    .queue-label { font-size: 12px; color: #666; margin-bottom: 5px; }
    .queue-number {
      font-size: 48px;
      font-weight: bold;
      color: #000;
      letter-spacing: 2px;
    }
    .qr-section {
      margin: 20px 0;
      padding: 10px 0;
      border-top: 2px dashed #000;
      border-bottom: 2px dashed #000;
    }
    .qr-label { font-size: 11px; margin-bottom: 10px; font-weight: bold; }
    .qr-code { width: 150px; height: 150px; margin: 0 auto; }
    .instructions {
      font-size: 10px;
      line-height: 1.4;
      margin: 10px 0;
      padding: 0 5px;
    }
    .footer { font-size: 9px; color: #666; margin-top: 10px; font-style: italic; }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="hospital-name">CITY GENERAL HOSPITAL</div>
      <div class="timestamp">${timestamp}</div>
    </div>
    <div class="queue-section">
      <div class="queue-label">Your Queue Number</div>
      <div class="queue-number">${String(queueNumber).padStart(3, '0')}</div>
    </div>
    <div class="qr-section">
      <div class="qr-label">Scan to Register</div>
      <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">
    </div>
    <div class="instructions">
      Please scan the QR code above to complete your registration. You will be called when it's your turn.
    </div>
    <div class="footer">Thank you for your patience</div>
  </div>
</body>
</html>`;

  return {
    success: true,
    ticketHtml,
    qrCodeDataUrl,
    printJobId: `mock-print-job-${Date.now()}`,
    timestamp,
  };
}

/**
 * Reset queue number (for testing)
 */
export function resetMockQueue() {
  currentQueueNumber = 0;
}
