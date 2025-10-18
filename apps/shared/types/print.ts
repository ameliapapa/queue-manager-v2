import { Timestamp } from 'firebase/firestore';

export interface PrintTicket {
  queueNumber: number;
  qrCodeDataUrl: string; // Base64 QR code image
  timestamp: string; // Human-readable time
  registrationUrl: string; // Full URL for QR code
  hospitalName: string;
  instructions: string;
}

export interface PrintJob {
  id: string;
  queueNumber: number;
  status: 'pending' | 'printing' | 'success' | 'failed';
  createdAt: Timestamp;
  printedAt: Timestamp | null;
  error: string | null;
}

export interface PrinterConfig {
  printerName?: string;
  paperWidth: number; // mm
  paperHeight: number; // mm
  margin: number; // mm
  dpi: number;
}

export interface GeneratePrintTicketRequest {
  queueNumber: number;
  registrationUrl: string;
}

export interface GeneratePrintTicketResponse {
  ticketHtml: string;
  qrCodeDataUrl: string;
  printJobId: string;
}
