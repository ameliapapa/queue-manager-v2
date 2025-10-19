import { useState, useEffect } from 'react';
import QueueNumber from './components/QueueNumber';
import RegistrationForm from './components/RegistrationForm';
import SuccessScreen from './components/SuccessScreen';
import { websocketClient } from './services/websocket';
import { sq } from './i18n/sq';
import './styles/index.css';

type AppState = 'loading' | 'form' | 'submitting' | 'success' | 'error';

interface PatientData {
  name: string;
  phone: string;
  age: string;
  gender: string;
  notes?: string;
}

function App() {
  const [state, setState] = useState<AppState>('loading');
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    websocketClient.connect('http://localhost:3005');

    return () => {
      websocketClient.disconnect();
    };
  }, []);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queueParam = params.get('queue');
    const patientParam = params.get('patient');

    if (!queueParam) {
      setError('Invalid QR code: No queue number found');
      setState('error');
      return;
    }

    const queueNum = parseInt(queueParam, 10);
    if (isNaN(queueNum) || queueNum <= 0) {
      setError('Invalid queue number');
      setState('error');
      return;
    }

    setQueueNumber(queueNum);
    setPatientId(patientParam);
    setState('form');
  }, []);

  const handleSubmit = async (data: PatientData) => {
    setState('submitting');
    setError(null);

    try {
      // Import and call registration service
      const { submitRegistration } = await import('./services/registration');

      await submitRegistration({
        queueNumber: queueNumber!,
        patientId: patientId || undefined,
        ...data,
      });

      setState('success');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to submit registration');
      setState('form'); // Return to form so user can retry
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#fdf2f4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#8B2E42' }}></div>
          <p className="mt-4 text-gray-600">{sq.loading.pleaseWait}</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#fdf2f4' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#fce7eb' }}>
            <svg className="w-8 h-8" style={{ color: '#8B2E42' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{sq.error.title}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">{sq.error.contactReception}</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return <SuccessScreen queueNumber={queueNumber!} />;
  }

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#fdf2f4' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {sq.header.hospitalName}
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {sq.header.hospitalSubtitle}
          </h2>
          <p className="text-gray-600 mt-1">{sq.header.title}</p>
        </div>

        {/* Queue Number Display */}
        {queueNumber && <QueueNumber queueNumber={queueNumber} />}

        {/* Error Message */}
        {error && (
          <div className="mb-6 border rounded-xl p-4" style={{ backgroundColor: '#fce7eb', borderColor: '#fad1d9' }}>
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" style={{ color: '#8B2E42' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm" style={{ color: '#8B2E42' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <RegistrationForm
          onSubmit={handleSubmit}
          isSubmitting={state === 'submitting'}
        />
      </div>
    </div>
  );
}

export default App;
