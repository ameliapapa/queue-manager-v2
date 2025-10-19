import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/firebase/config';
import { IdleScreen } from './components/IdleScreen';
import { GetNumberButton } from './components/GetNumberButton';
import { PrintingIndicator } from './components/PrintingIndicator';
import { SuccessScreen } from './components/SuccessScreen';
import { ErrorScreen } from './components/ErrorScreen';
import { generateQueueNumber } from './services/queueService';
import { printTicket } from './services/printService';
import { midnightResetService } from '@shared/services/midnightResetService';
import { sq } from './i18n/sq';

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

  // Start midnight reset service
  useEffect(() => {
    midnightResetService.start();

    return () => {
      midnightResetService.stop();
    };
  }, []);

  // ✅ OPTIMIZED: Real-time queue stats listener (replaces polling)
  useEffect(() => {
    // Get today's date string
    const getTodayDateString = () => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    };

    const dateString = getTodayDateString();
    const counterRef = doc(db, 'queueCounter', dateString);

    // Listen to counter document for real-time updates
    const unsubscribe = onSnapshot(
      counterRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const totalToday = data?.counter || 0;

          // Estimate pending/registered based on typical workflow
          const estimatedPending = Math.floor(totalToday * 0.3);
          const estimatedRegistered = Math.floor(totalToday * 0.5);

          setQueueStats({
            totalToday,
            pending: estimatedPending,
            registered: estimatedRegistered,
          });
        } else {
          // Counter doesn't exist yet (first patient of the day)
          setQueueStats({
            totalToday: 0,
            pending: 0,
            registered: 0,
          });
        }
      },
      (error) => {
        console.error('❌ Error listening to queue counter:', error);
        // Fallback to empty stats on error
        setQueueStats({
          totalToday: 0,
          pending: 0,
          registered: 0,
        });
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []); // ✅ Only run ONCE on mount

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
                  {sq.activeScreen.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {sq.activeScreen.subtitle}
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
                {sq.activeScreen.back}
              </button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex items-center justify-center">
            <GetNumberButton onPress={handleGenerateNumber} />
          </main>
        </div>
      );

    case 'GENERATING':
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-24 h-24 mx-auto mb-6 border-8 rounded-full animate-spin"
              style={{
                borderColor: '#fad1d9',
                borderTopColor: '#8B2E42',
              }}
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {sq.generating.title}
            </h2>
            <p className="text-xl text-gray-600">{sq.generating.subtitle}</p>
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
