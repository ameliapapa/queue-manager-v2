import { useState, useEffect } from 'react';
import QueueNumber from './components/QueueNumber';
import RegistrationForm from './components/RegistrationForm';
import SuccessScreen from './components/SuccessScreen';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Please scan a valid QR code from the kiosk</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return <SuccessScreen queueNumber={queueNumber!} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            City General Hospital
          </h1>
          <p className="text-gray-600">Patient Registration</p>
        </div>

        {/* Queue Number Display */}
        {queueNumber && <QueueNumber queueNumber={queueNumber} />}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
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
