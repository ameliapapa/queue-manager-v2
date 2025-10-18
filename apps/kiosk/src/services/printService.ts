/**
 * Print Service
 * Generates printable tickets using browser Print API
 * Works with thermal printers or standard printers
 */

/**
 * Generate and print a ticket
 * @param queueNumber The queue number to print
 * @param registrationUrl The URL for patient registration
 * @param patientId The patient document ID
 * @param qrCodeDataUrl Optional QR code data URL (if already generated)
 * @returns Promise that resolves when print is complete
 */
export async function printTicket(
  queueNumber: number,
  registrationUrl: string,
  patientId: string,
  qrCodeDataUrl?: string
): Promise<void> {

  try {
    // Simulate ticket generation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate ticket HTML
    const ticketHtml = generateTicketHTML(
      queueNumber,
      registrationUrl,
      qrCodeDataUrl
    );


    // Print using browser Print API
    await printUsingBrowserAPI(ticketHtml);

  } catch (error: any) {
    console.error('❌ Error printing ticket:', error);
    throw new Error(
      error.message || 'Failed to print ticket. Please contact staff.'
    );
  }
}

/**
 * Generate HTML for ticket printing
 */
function generateTicketHTML(
  queueNumber: number,
  registrationUrl: string,
  qrCodeDataUrl?: string
): string {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Use provided QR code or generate a simple placeholder
  const queueNumberPadded = String(queueNumber).padStart(3, '0');
  const qrCode =
    qrCodeDataUrl ||
    `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="white"/>
      <rect x="40" y="40" width="120" height="120" fill="black"/>
      <text x="100" y="105" text-anchor="middle" fill="white" font-size="20" font-family="Arial">Q${queueNumberPadded}</text>
    </svg>`
    )}`;

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
      <div class="hospital-name">City General Hospital</div>
      <div class="timestamp">${timestamp}</div>
    </div>

    <div class="queue-section">
      <div class="queue-label">Your Queue Number</div>
      <div class="queue-number">Q${queueNumberPadded}</div>
    </div>

    <div class="qr-section">
      <div class="qr-label">Scan to Register</div>
      <img src="${qrCode}" alt="QR Code" class="qr-code">
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
 * Print HTML content using browser's print API
 * This works with thermal printers set as default printer
 */
async function printUsingBrowserAPI(htmlContent: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      // Wait for iframe to load
      iframe.onload = () => {
        try {
          const iframeWindow = iframe.contentWindow;
          const iframeDocument = iframe.contentDocument;

          if (!iframeWindow || !iframeDocument) {
            throw new Error('Failed to access iframe');
          }

          // Write HTML content to iframe
          iframeDocument.open();
          iframeDocument.write(htmlContent);
          iframeDocument.close();


          // Wait for content to render
          setTimeout(() => {
            try {

              // Trigger print
              iframeWindow.print();

              // Listen for print completion
              iframeWindow.onafterprint = () => {
                document.body.removeChild(iframe);
                resolve();
              };

              // Fallback: remove iframe after delay
              setTimeout(() => {
                if (document.body.contains(iframe)) {
                  document.body.removeChild(iframe);
                  resolve();
                }
              }, 3000);
            } catch (printError) {
              console.error('❌ Print error:', printError);
              document.body.removeChild(iframe);
              reject(printError);
            }
          }, 500);
        } catch (error) {
          console.error('❌ Iframe content error:', error);
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      // Handle iframe load error
      iframe.onerror = () => {
        console.error('❌ Failed to load iframe');
        document.body.removeChild(iframe);
        reject(new Error('Failed to load print content'));
      };

      // Set iframe source to trigger onload
      iframe.src = 'about:blank';
    } catch (error) {
      console.error('❌ Print setup error:', error);
      reject(error);
    }
  });
}

/**
 * Check if printer is available
 * Note: Browser API doesn't allow direct printer detection,
 * this is a best-effort check
 */
export function isPrinterAvailable(): boolean {
  // Check if print API is available
  if (!window.print) {
    console.warn('⚠️  Print API not available');
    return false;
  }

  return true;
}

/**
 * Display ticket preview in a new window (for testing without printer)
 */
export async function previewTicket(
  queueNumber: number,
  registrationUrl: string,
  qrCodeDataUrl?: string
): Promise<void> {

  try {
    const ticketHtml = generateTicketHTML(
      queueNumber,
      registrationUrl,
      qrCodeDataUrl
    );

    // Open in new window for preview
    const previewWindow = window.open('', '_blank', 'width=400,height=600');
    if (previewWindow) {
      previewWindow.document.write(ticketHtml);
      previewWindow.document.close();
    } else {
      console.error('❌ Failed to open preview window (popup blocked?)');
    }
  } catch (error) {
    console.error('❌ Error previewing ticket:', error);
    throw error;
  }
}
