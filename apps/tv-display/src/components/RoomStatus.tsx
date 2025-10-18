import { Room } from '../services/dataService';

interface RoomStatusProps {
  rooms: Room[];
}

export default function RoomStatus({ rooms }: RoomStatusProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">ROOM STATUS</h2>
        <p className="text-blue-100 text-sm mt-1">Current Patients</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {rooms.map((room) => (
            <div
              key={room.number}
              className={`p-6 transition-colors ${
                room.status === 'occupied'
                  ? 'bg-green-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl ${
                      room.status === 'occupied'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {room.number}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">
                      Room {room.number}
                    </div>
                    {room.currentPatient ? (
                      <div className="mt-1">
                        <div className="text-3xl font-bold text-gray-900">
                          Q{String(room.currentPatient.queueNumber).padStart(3, '0')}
                        </div>
                        {room.currentPatient.name && (
                          <div className="text-sm text-gray-600 mt-1">
                            {room.currentPatient.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xl font-semibold text-gray-400 mt-1">
                        Available
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {room.status === 'occupied' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">
                        In Progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
