import { useState, useEffect } from 'react';
import RoomStatus from './components/RoomStatus';
import RegisteredPatients from './components/RegisteredPatients';
import UnregisteredQueue from './components/UnregisteredQueue';
import { websocketClient } from './services/websocket';
import {
  getAllPatients,
  getRoomStatuses,
  getRegisteredWaitingPatients,
  getUnregisteredPatients,
  Patient,
  Room,
} from './services/dataService';
import './styles/index.css';

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [registeredPatients, setRegisteredPatients] = useState<Patient[]>([]);
  const [unregisteredPatients, setUnregisteredPatients] = useState<Patient[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch and process data
  const fetchData = async () => {
    try {
      const allPatients = await getAllPatients();
      setPatients(allPatients);

      // Process data for each column
      setRooms(getRoomStatuses(allPatients));
      setRegisteredPatients(getRegisteredWaitingPatients(allPatients));
      setUnregisteredPatients(getUnregisteredPatients(allPatients));
      setLastUpdate(new Date());

      console.log('📊 Data refreshed:', {
        total: allPatients.length,
        inRooms: allPatients.filter((p) => p.status === 'called').length,
        registered: getRegisteredWaitingPatients(allPatients).length,
        unregistered: getUnregisteredPatients(allPatients).length,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Connect to WebSocket on mount
  useEffect(() => {
    websocketClient.connect('http://localhost:3005');

    const checkConnection = setInterval(() => {
      setIsConnected(websocketClient.isConnected());
    }, 1000);

    return () => {
      clearInterval(checkConnection);
      websocketClient.disconnect();
    };
  }, []);

  // Initial data fetch and periodic refresh
  useEffect(() => {
    fetchData();

    // Refresh every 30 seconds as backup
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen to WebSocket events for real-time updates
  useEffect(() => {
    const unsubQueue = websocketClient.on('queue:issued', (data) => {
      console.log('📢 Queue issued:', data);
      fetchData();
    });

    const unsubRegistered = websocketClient.on('patient:registered', (data) => {
      console.log('📢 Patient registered:', data);
      fetchData();
    });

    const unsubCalled = websocketClient.on('patient:called', (data) => {
      console.log('📢 Patient called:', data);
      fetchData();
    });

    const unsubCompleted = websocketClient.on('patient:completed', (data) => {
      console.log('📢 Patient completed:', data);
      fetchData();
    });

    const unsubRoom = websocketClient.on('room:updated', (data) => {
      console.log('📢 Room updated:', data);
      fetchData();
    });

    return () => {
      unsubQueue();
      unsubRegistered();
      unsubCalled();
      unsubCompleted();
      unsubRoom();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">City General Hospital</h1>
              <p className="text-blue-100 mt-2 text-lg">Queue Management System</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}
                ></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'Live Updates Active' : 'Connecting...'}
                </span>
              </div>
              <div className="text-sm text-blue-200 mt-2">
                Last updated: {lastUpdate.toLocaleTimeString()}
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
