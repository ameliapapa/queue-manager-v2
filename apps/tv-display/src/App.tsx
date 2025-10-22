import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import RoomStatus from './components/RoomStatus';
import RegisteredPatients from './components/RegisteredPatients';
import { Patient, Room } from './services/dataService';
import hospitalLogo from './assets/mbreteresha_geraldine.svg';
import './styles/index.css';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
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
      },
      (error) => {
        console.error('❌ Error listening to patients:', error);
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
        const newRooms: Room[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();

          const room: Room = {
            number: data.roomNumber,
            status: data.status === 'paused' ? 'paused' :
                    data.currentPatient ? 'busy' : 'available',
            currentPatient: data.currentPatient ? {
              id: data.currentPatient.id || '',
              queueNumber: data.currentPatient.queueNumber || 0,
              name: data.currentPatient.name,
              status: 'called',
            } : undefined,
          };

          newRooms.push(room);
        });

        const sortedRooms = newRooms.sort((a, b) => a.number - b.number);
        setRooms(sortedRooms);
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

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(136.392deg, rgb(249, 250, 251) 0%, rgb(243, 244, 246) 100%)' }}>
      {/* Header */}
      <header className="text-white shadow-lg rounded-3xl mb-6" style={{ backgroundColor: '#a03c52', height: '140px' }}>
        <div className="px-6 h-full flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-5">
              {/* Hospital Logo */}
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shrink-0 p-1">
                <img src={hospitalLogo} alt="Spitali Mbretëresha Geraldine" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-medium leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Spitali Mbretëresha Geraldine
                </h1>
                <p className="text-xl opacity-90 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Sistemi i Radhës së Pritjes
                </p>
              </div>
            </div>
            <div className="text-right flex flex-col">
              <div className="text-4xl font-normal leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {lastUpdate.toLocaleTimeString('sq-AL')}
              </div>
              <div className="text-xl opacity-90 leading-tight mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {lastUpdate.toLocaleDateString('sq-AL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout: 1/3 Registered, 2/3 Rooms */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left Column (1/3): Registered Patients */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden col-span-1">
          <RegisteredPatients patients={registeredPatients} />
        </div>

        {/* Right Column (2/3): Room Status */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden col-span-2">
          <RoomStatus rooms={rooms} />
        </div>
      </div>
    </div>
  );
}

export default App;
