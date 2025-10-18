import { useState, useEffect, useCallback } from 'react';
import { IdleScreen } from './components/IdleScreen';
import { GetNumberButton } from './components/GetNumberButton';
import { PrintingIndicator } from './components/PrintingIndicator';
import { SuccessScreen } from './components/SuccessScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { generateQueueNumber, getQueueStats } from './services/queueService';
import { printTicket } from './services/printService';
import { midnightResetService } from '@shared/services/midnightResetService';
// ❌ WebSocket removed - Dashboard uses Firestore real-time listeners
// import { websocketClient } from './services/websocket';
import { UPDATE_INTERVALS } from './constants';

// App states
type AppState = 'IDLE' | 'ACTIVE' | 'GENERATING' | 'PRINTING' | 'SUCCESS' | 'ERROR';

interface QueueData {
  queueNumber: number;
  patientId: string;
  registrationUrl: string;
}

interface QueueStats {
  totalToday: number;
  pending: number;
  registered: number;
}

function App() {
  // State machine
  const [state, setState] = useState<AppState>('IDLE');
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);

  // ❌ WebSocket connection removed - not needed anymore
  // Dashboard uses Firestore onSnapshot for real-time updates

  // Start midnight reset service
  useEffect(() => {
    console.log('🌙 Starting midnight reset service for Kiosk');
    midnightResetService.start();

    return () => {
      midnightResetService.stop();
    };
  }, []);

  // Fetch queue stats periodically when idle
  useEffect(() => {
    if (state === 'IDLE') {
      // Fetch immediately
      getQueueStats().then(setQueueStats);

      // Then fetch every 10 seconds
      const interval = setInterval(() => {
        getQueueStats().then(setQueueStats);
      }, UPDATE_INTERVALS.kiosk);

      return () => clearInterval(interval);
    }
  }, [state]);

  // Auto-return to idle from ACTIVE state after inactivity
  useEffect(() => {
    if (state === 'ACTIVE') {
      const timeout = setTimeout(() => {
        setState('IDLE');
      }, 30000); // 30 seconds of inactivity

      return () => clearTimeout(timeout);
    }
  }, [state]);

  // Handle wake from idle screen
  const handleWake = useCallback(() => {
    setState('ACTIVE');
  }, []);

  // Handle generate queue number
  const handleGenerateNumber = useCallback(async () => {
    setState('GENERATING');
    setError(null);

    try {
      // Step 1: Generate queue number from Firestore
      const result = await generateQueueNumber();

      setQueueData({
        queueNumber: result.queueNumber,
        patientId: result.patientId,
        registrationUrl: result.registrationUrl,
      });

      // Step 2: Print ticket
      setState('PRINTING');

      await printTicket(
        result.queueNumber,
        result.registrationUrl,
        result.patientId,
        result.qrCodeDataUrl // Pass the QR code data URL
      );

      // Step 3: Show success
      setState('SUCCESS');
    } catch (err: any) {
      console.error('Error in queue generation/printing:', err);
      setError(err.message || 'An unexpected error occurred');
      setState('ERROR');
    }
  }, []);

  // Handle retry after error
  const handleRetry = useCallback(() => {
    setState('ACTIVE');
    setError(null);
    setQueueData(null);
  }, []);

  // Handle cancel/go back
  const handleCancel = useCallback(() => {
    setState('IDLE');
    setError(null);
    setQueueData(null);
  }, []);

  // Handle success timeout (auto-return to idle)
  const handleSuccessTimeout = useCallback(() => {
    setState('IDLE');
    setQueueData(null);
  }, []);

  // Render based on current state
  switch (state) {
    case 'IDLE':
      return <IdleScreen onWake={handleWake} queueStats={queueStats || undefined} />;

    case 'ACTIVE':
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm py-6 px-8">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Queue Number System
                </h1>
                <p className="text-gray-600 mt-1">
                  Get your queue number in seconds
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-800 flex items-center text-lg"
              >
                <svg
                  className="w-6 h-6 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center">
            <GetNumberButton onPress={handleGenerateNumber} />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t py-6 px-8">
            <div className="max-w-6xl mx-auto">
              {queueStats && (
                <div className="flex justify-center gap-12">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {queueStats.totalToday}
                    </div>
                    <div className="text-gray-600">Patients Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">
                      {queueStats.pending + queueStats.registered}
                    </div>
                    <div className="text-gray-600">Currently Waiting</div>
                  </div>
                </div>
              )}
            </div>
          </footer>
        </div>
      );

    case 'GENERATING':
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 border-8 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Generating Queue Number...
            </h2>
            <p className="text-xl text-gray-600">Please wait a moment</p>
          </div>
        </div>
      );

    case 'PRINTING':
      return (
        <PrintingIndicator queueNumber={queueData?.queueNumber} />
      );

    case 'SUCCESS':
      return (
        <SuccessScreen
          queueNumber={queueData!.queueNumber}
          onTimeout={handleSuccessTimeout}
          autoReturnDelay={5000}
        />
      );

    case 'ERROR':
      return (
        <ErrorScreen
          error={error || 'An unknown error occurred'}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      );

    default:
      return null;
  }
}

export default App;
