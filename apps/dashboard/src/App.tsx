import { useState, useEffect } from 'react';
import { DashboardProvider, useDashboard } from './contexts/DashboardContext';
import RoomCard from './components/RoomCard';
import RegisteredQueueList from './components/RegisteredQueueList';
import UnregisteredQueueList from './components/UnregisteredQueueList';
import PatientModal from './components/PatientModal';
import RegistrationModal from './components/RegistrationModal';
import { Patient } from './types';
import { formatDistanceToNow } from 'date-fns';
import './styles/index.css';

function Dashboard() {
  const {
    rooms,
    registeredPatients,
    unregisteredQueue,
    notifications,
    isConnected,
    lastSync,
    assignPatient,
    clearNotification,
  } = useDashboard();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [registrationQueueNumber, setRegistrationQueueNumber] = useState<number | null>(null);

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

  const handleAssignNext = async (roomId: string) => {
    if (registeredPatients.length === 0) {
      alert('No patients in queue');
      return;
    }

    // Get oldest patient
    const oldestPatient = [...registeredPatients].sort((a, b) =>
      new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()
    )[0];

    if (window.confirm(`Assign ${oldestPatient.name} (Q${String(oldestPatient.queueNumber).padStart(3, '0')}) to this room?`)) {
      try {
        await assignPatient(oldestPatient.id, roomId);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
              <p className="text-sm text-gray-600">City General Hospital</p>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-4">
              {lastSync && (
                <p className="text-sm text-gray-600">
                  Last sync: {formatDistanceToNow(lastSync, { addSuffix: true })}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto p-6 space-y-6">
        {/* Rooms Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Doctor Rooms</h2>
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
        <section className="grid grid-cols-2 gap-6" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
          <RegisteredQueueList
            patients={registeredPatients}
            onPatientClick={setSelectedPatient}
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
              notif.type === 'success' ? 'bg-green-600 text-white' :
              notif.type === 'error' ? 'bg-red-600 text-white' :
              notif.type === 'warning' ? 'bg-yellow-600 text-white' :
              'bg-blue-600 text-white'
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

      {/* Modals */}
      {selectedPatient && (
        <PatientModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {registrationQueueNumber !== null && (
        <RegistrationModal
          queueNumber={registrationQueueNumber}
          onClose={() => setRegistrationQueueNumber(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

export default App;
