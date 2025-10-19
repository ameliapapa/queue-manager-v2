import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import RoomStatus from './components/RoomStatus';
import RegisteredPatients from './components/RegisteredPatients';
import UnregisteredQueue from './components/UnregisteredQueue';
import { Patient, Room } from './services/dataService';
import { sq } from './i18n/sq';
import './styles/index.css';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Helper function to get today's date string
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // ✅ OPTIMIZED: Set up Firestore real-time listeners (no more WebSocket polling!)
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    const dateString = getTodayDateString();

    // Listener 1: All patients for today
    const patientsQ = query(
      collection(db, 'patients'),
      orderBy('queueNumber', 'asc'),
      limit(100)
    );

    const unsubPatients = onSnapshot(
      patientsQ,
      (snapshot) => {
        // ✅ OPTIMIZED: Use docChanges for incremental updates
        setPatients(prev => {
          const patientsMap = new Map(prev.map(p => [p.id, p]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();
            const createdAt = data.createdAt?.toDate();

            // Only include today's patients
            if (!createdAt || createdAt.toISOString().split('T')[0] !== dateString) {
              if (change.type === 'removed' || change.type === 'modified') {
                patientsMap.delete(doc.id);
              }
              return;
            }

            const patient: Patient = {
              id: doc.id,
              queueNumber: data.queueNumber,
              name: data.name,
              phone: data.phone,
              age: data.age,
              gender: data.gender,
              status: data.status || 'pending',
              roomNumber: data.roomNumber,
              registeredAt: data.registeredAt?.toDate(),
              calledAt: data.calledAt?.toDate(),
              completedAt: data.completedAt?.toDate(),
              createdAt: data.createdAt?.toDate(),
            };

            if (change.type === 'removed') {
              patientsMap.delete(doc.id);
            } else {
              patientsMap.set(doc.id, patient);
            }
          });

          const updatedPatients = Array.from(patientsMap.values());
          setLastUpdate(new Date());
          return updatedPatients;
        });
        setIsConnected(true);
      },
      (error) => {
        console.error('❌ Error listening to patients:', error);
        setIsConnected(false);
      }
    );
    unsubscribers.push(unsubPatients);

    // Listener 2: Rooms from Firestore
    const roomsQ = query(
      collection(db, 'rooms'),
      orderBy('roomNumber', 'asc')
    );

    const unsubRooms = onSnapshot(
      roomsQ,
      (snapshot) => {
        // ✅ OPTIMIZED: Use docChanges for incremental updates
        setRooms(prev => {
          const roomsMap = new Map(prev.map(r => [r.number, r]));

          snapshot.docChanges().forEach(change => {
            const doc = change.doc;
            const data = doc.data();

            const room: Room = {
              number: data.roomNumber,
              status: data.status === 'paused' ? 'paused' :
                      data.currentPatient ? 'occupied' : 'available',
              currentPatient: data.currentPatient ? {
                id: data.currentPatient.id || '',
                queueNumber: data.currentPatient.queueNumber || 0,
                name: data.currentPatient.name,
                status: 'called',
              } : undefined,
            };

            if (change.type === 'removed') {
              roomsMap.delete(data.roomNumber);
            } else {
              roomsMap.set(data.roomNumber, room);
            }
          });

          return Array.from(roomsMap.values()).sort((a, b) => a.number - b.number);
        });
      },
      (error) => {
        console.error('❌ Error listening to rooms:', error);
      }
    );
    unsubscribers.push(unsubRooms);

    // Cleanup: unsubscribe from all listeners on unmount
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []); // ✅ Only run ONCE on mount

  // ✅ OPTIMIZED: Use useMemo to compute derived data (only recompute when patients change)
  const registeredPatients = useMemo(() => {
    return patients
      .filter((p) => p.status === 'registered' && p.name)
      .sort((a, b) => a.queueNumber - b.queueNumber);
  }, [patients]);

  const unregisteredPatients = useMemo(() => {
    return patients
      .filter((p) => p.status === 'pending' || !p.name)
      .sort((a, b) => a.queueNumber - b.queueNumber);
  }, [patients]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="text-white shadow-lg" style={{ backgroundColor: '#8B2E42' }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">{sq.header.hospitalName}</h1>
              <p className="text-primary-100 mt-2 text-lg">{sq.header.hospitalSubtitle}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Përditësime Live' : 'Duke u lidhur...'}
                </span>
              </div>
              <div className="text-sm text-primary-200 mt-2">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="h-[calc(100vh-120px)] grid grid-cols-3 gap-6 p-6">
        {/* Column 1: Room Status */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <RoomStatus rooms={rooms} />
        </div>

        {/* Column 2: Registered Patients */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <RegisteredPatients patients={registeredPatients} />
        </div>

        {/* Column 3: Unregistered Queue */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <UnregisteredQueue patients={unregisteredPatients} />
        </div>
      </div>
    </div>
  );
}

export default App;
