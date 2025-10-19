/**
 * Print Service
 * Generates printable tickets using browser Print API
 * Works with thermal printers or standard printers
 */

import logoSvg from '../assets/mbreteresha_geraldine.svg';

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
      qrCodeDataUrl,
      logoSvg
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
  qrCodeDataUrl?: string,
  hospitalLogoUrl?: string
): string {
  const now = new Date();

  // Format date in Albanian: dd.mm.yyyy
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${day}.${month}.${year}`;

  // Format time: HH:mm:ss
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  // Use provided QR code or generate a simple placeholder
  const queueNumberPadded = String(queueNumber).padStart(3, '0');
  const qrCode =
    qrCodeDataUrl ||
    `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="200" height="200" fill="white"/>
      <rect x="40" y="40" width="120" height="120" fill="black"/>
      <text x="100" y="105" text-anchor="middle" fill="white" font-size="20" font-family="Arial">${queueNumberPadded}</text>
    </svg>`
    )}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: 80mm auto;
      margin: 0;
    }

    body {
      font-family: 'Poppins', 'Arial', sans-serif;
      width: 80mm;
      padding: 8mm;
      background: white;
    }

    .ticket {
      text-align: center;
      background: white;
      padding: 0;
    }

    .logo-container {
      margin: 0 auto 10px;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: brightness(0);
    }

    .logo {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .datetime {
      font-size: 15px;
      font-weight: 400;
      color: #000;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }

    .queue-label {
      font-size: 13px;
      font-weight: 400;
      color: #000;
      margin-bottom: 6px;
    }

    .queue-number-box {
      background: white;
      border: 1px solid #000;
      border-radius: 25px;
      padding: 12px 25px;
      margin: 6px auto 10px;
      display: inline-block;
      min-width: 180px;
    }

    .queue-number {
      font-size: 64px;
      font-weight: 400;
      color: #000;
      letter-spacing: 6px;
      line-height: 1;
    }

    .qr-instructions {
      font-size: 12px;
      font-weight: 400;
      color: #000;
      margin: 8px 0 6px;
      line-height: 1.3;
      padding: 0 10px;
    }

    .qr-code-container {
      margin: 6px auto 0;
      background: white;
      padding: 0;
      border-radius: 0;
      display: inline-block;
    }

    .qr-code {
      width: 100px;
      height: 100px;
      display: block;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="logo-container">
      <img src="${hospitalLogoUrl || ''}" alt="Hospital Logo" class="logo">
    </div>

    <div class="datetime">${dateStr}    ${timeStr}</div>

    <div class="queue-label">Numri juaj në rradhë është:</div>

    <div class="queue-number-box">
      <div class="queue-number">${queueNumberPadded}</div>
    </div>

    <div class="qr-instructions">
      Skanoni kodin QR për të plotësuar regjistrimin, ose drejtohuni drejt recepsionit:
    </div>

    <div class="qr-code-container">
      <img src="${qrCode}" alt="QR Code" class="qr-code">
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
      qrCodeDataUrl,
      logoSvg
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
