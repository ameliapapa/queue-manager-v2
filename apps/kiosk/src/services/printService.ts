import { httpsCallable } from 'firebase/functions';
import { functions } from '@shared/firebase/config';

interface PrintTicketRequest {
  queueNumber: number;
  registrationUrl: string;
  patientId: string;
}

interface PrintTicketResponse {
  success: boolean;
  ticketHtml: string;
  qrCodeDataUrl: string;
  printJobId: string;
  timestamp: string;
}

/**
 * Service for printing queue tickets on thermal printer
 */

/**
 * Generate and print a ticket
 * @param queueNumber The queue number to print
 * @param registrationUrl The URL for patient registration
 * @param patientId The patient document ID
 * @returns Promise that resolves when print is complete
 */
export async function printTicket(
  queueNumber: number,
  registrationUrl: string,
  patientId: string
): Promise<void> {
  try {
    // Step 1: Generate ticket HTML from Cloud Function
    const generatePrintTicket = httpsCallable<
      PrintTicketRequest,
      PrintTicketResponse
    >(functions, 'generatePrintTicket');

    const result = await generatePrintTicket({
      queueNumber,
      registrationUrl,
      patientId,
    });

    if (!result.data.success) {
      throw new Error('Failed to generate print ticket');
    }

    const { ticketHtml } = result.data;

    // Step 2: Print using browser Print API
    await printUsingBrowserAPI(ticketHtml);
  } catch (error: any) {
    console.error('Error printing ticket:', error);
    throw new Error(
      error.message || 'Failed to print ticket. Please contact staff.'
    );
  }
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
              document.body.removeChild(iframe);
              reject(printError);
            }
          }, 500);
        } catch (error) {
          document.body.removeChild(iframe);
          reject(error);
        }
      };

      // Handle iframe load error
      iframe.onerror = () => {
        document.body.removeChild(iframe);
        reject(new Error('Failed to load print content'));
      };

      // Set iframe source to trigger onload
      iframe.src = 'about:blank';
    } catch (error) {
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
    return false;
  }

  // In production, you might check for specific printer via WebUSB
  // or other APIs, but for now we assume if print API exists, printer is available
  return true;
}

/**
 * Display ticket preview in a new window (for testing without printer)
 */
export async function previewTicket(
  queueNumber: number,
  registrationUrl: string,
  patientId: string
): Promise<void> {
  try {
    const generatePrintTicket = httpsCallable<
      PrintTicketRequest,
      PrintTicketResponse
    >(functions, 'generatePrintTicket');

    const result = await generatePrintTicket({
      queueNumber,
      registrationUrl,
      patientId,
    });

    if (!result.data.success) {
      throw new Error('Failed to generate ticket preview');
    }

    // Open in new window for preview
    const previewWindow = window.open('', '_blank', 'width=400,height=600');
    if (previewWindow) {
      previewWindow.document.write(result.data.ticketHtml);
      previewWindow.document.close();
    }
  } catch (error) {
    console.error('Error previewing ticket:', error);
    throw error;
  }
}
