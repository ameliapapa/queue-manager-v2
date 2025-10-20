"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTicketHTML = generateTicketHTML;
exports.getFormattedTimestamp = getFormattedTimestamp;
/**
 * Generate HTML for ticket printing
 * @param queueNumber - The queue number
 * @param qrCodeDataUrl - Base64 data URL of QR code
 * @param timestamp - Human-readable timestamp
 * @param hospitalName - Name of the hospital
 * @returns HTML string for the ticket
 */
function generateTicketHTML(queueNumber, qrCodeDataUrl, timestamp, hospitalName) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: 80mm 120mm;
      margin: 5mm;
    }

    body {
      font-family: 'Arial', sans-serif;
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
      text-transform: uppercase;
    }

    .timestamp {
      font-size: 10px;
      color: #666;
    }

    .queue-section {
      margin: 20px 0;
    }

    .queue-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }

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

    .qr-label {
      font-size: 11px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .qr-code {
      width: 150px;
      height: 150px;
      margin: 0 auto;
    }

    .instructions {
      font-size: 10px;
      line-height: 1.4;
      margin: 10px 0;
      padding: 0 5px;
    }

    .footer {
      font-size: 9px;
      color: #666;
      margin-top: 10px;
      font-style: italic;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="header">
      <div class="hospital-name">${hospitalName}</div>
      <div class="timestamp">${timestamp}</div>
    </div>

    <div class="queue-section">
      <div class="queue-label">Your Queue Number</div>
      <div class="queue-number">Q${String(queueNumber).padStart(3, '0')}</div>
    </div>

    <div class="qr-section">
      <div class="qr-label">Scan to Register</div>
      <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code">
    </div>

    <div class="instructions">
      Please scan the QR code above to complete your registration. You will be called when it's your turn.
    </div>

    <div class="footer">
      Thank you for your patience
    </div>
  </div>
</body>
</html>
  `.trim();
}
/**
 * Get formatted timestamp for ticket
 * @returns Human-readable timestamp
 */
function getFormattedTimestamp() {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
    return `${date} at ${time}`;
}
//# sourceMappingURL=pdfGenerator.js.map