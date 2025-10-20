import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { DashboardProvider, useDashboard } from './contexts/DashboardContext';
import Login from './components/Login';
import RoomCard from './components/RoomCard';
import RegisteredQueueList from './components/RegisteredQueueList';
import UnregisteredQueueList from './components/UnregisteredQueueList';
import DailyStatsOverview from './components/DailyStatsOverview';
import { Patient } from './types';
import { formatDistanceToNow } from 'date-fns';
import { sq } from './i18n/sq';
import { midnightResetService } from '@shared/services/midnightResetService';
import './styles/index.css';

// ✅ Code Splitting: Lazy load modals (only loaded when needed)
const PatientModal = lazy(() => import('./components/PatientModal'));
const RegistrationModal = lazy(() => import('./components/RegistrationModal'));

// Loading fallback for lazy-loaded modals
function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
          <p className="text-lg font-medium text-gray-700">{sq.modal.loading}</p>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const {
    rooms,
    registeredPatients,
    unregisteredQueue,
    allPatients,
    assignments,
    notifications,
    isConnected,
    lastSync,
    assignPatient,
    clearNotification,
  } = useDashboard();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [registrationQueueNumber, setRegistrationQueueNumber] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  // Handle logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc to close modals
      if (e.key === 'Escape') {
        setSelectedPatient(null);
        setRegistrationQueueNumber(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ✅ OPTIMIZED: No client-side sorting needed - registeredPatients already sorted by queueNumber
  const handleAssignNext = useCallback(async (roomId: string) => {
    if (registeredPatients.length === 0) {
      alert(sq.alerts.noPatients);
      return;
    }

    // ✅ FAST: Just take first patient (already sorted by queueNumber in Firestore query)
    const nextPatient = registeredPatients[0];

    if (window.confirm(sq.alerts.assignConfirm.replace('{name}', nextPatient.name).replace('{number}', String(nextPatient.queueNumber).padStart(3, '0')))) {
      try {
        await assignPatient(nextPatient.id, roomId);
      } catch (error) {
        // Error handled by context
      }
    }
  }, [registeredPatients, assignPatient]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sq.header.title}</h1>
              <p className="text-sm text-gray-600">{sq.header.hospitalName}</p>
              <p className="text-sm text-gray-600">{sq.header.hospitalSubtitle}</p>
            </div>

            {/* Status Indicator & User Info */}
            <div className="flex items-center space-x-4">
              {lastSync && (
                <p className="text-sm text-gray-600">
                  {sq.header.lastSync}: {formatDistanceToNow(lastSync, { addSuffix: true })}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary-800' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? sq.header.connected : sq.header.disconnected}
                </span>
              </div>
              {currentUser && (
                <>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{currentUser.displayName || currentUser.email}</p>
                      <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-6 space-y-6">
        {/* Rooms Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">{sq.rooms.title}</h2>
          <div className="grid grid-cols-5 gap-4">
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                onAssignNext={() => handleAssignNext(room.id)}
              />
            ))}
          </div>
        </section>

        {/* Queue Section */}
        <section className="grid grid-cols-3 gap-6" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <RegisteredQueueList
            patients={registeredPatients}
            onPatientClick={setSelectedPatient}
          />
          <DailyStatsOverview
            patients={allPatients}
            assignments={assignments}
          />
          <UnregisteredQueueList
            queue={unregisteredQueue}
            onRegister={setRegistrationQueueNumber}
          />
        </section>
      </main>

      {/* Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-6 py-4 rounded-lg shadow-lg flex items-start space-x-3 min-w-[300px] animate-slide-in ${
              notif.type === 'success' ? 'bg-primary-800 text-white' :
              notif.type === 'error' ? 'bg-red-600 text-white' :
              notif.type === 'warning' ? 'bg-yellow-600 text-white' :
              'bg-primary-800 text-white'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">{notif.message}</p>
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Modals with Suspense boundaries for code splitting */}
      {selectedPatient && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PatientModal
            patient={selectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        </Suspense>
      )}

      {registrationQueueNumber !== null && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <RegistrationModal
            queueNumber={registrationQueueNumber}
            onClose={() => setRegistrationQueueNumber(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Start midnight reset service
  useEffect(() => {
    if (isAuthenticated) {
      midnightResetService.start();
      return () => {
        midnightResetService.stop();
      };
    }
  }, [isAuthenticated]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Show dashboard if authenticated
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

export default App;
