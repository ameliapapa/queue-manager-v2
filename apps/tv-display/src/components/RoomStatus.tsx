import { memo } from 'react';
import { Room } from '../services/dataService';
import { sq } from '../i18n/sq';

interface RoomStatusProps {
  rooms: Room[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function RoomStatus({ rooms }: RoomStatusProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="text-white px-6 py-4" style={{ backgroundColor: '#8B2E42' }}>
        <h2 className="text-2xl font-bold">{sq.rooms.title}</h2>
        <p className="text-primary-100 text-sm mt-1">{sq.rooms.nowServing}</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {rooms.map((room) => {
            const isOccupiedOrPaused = room.status === 'occupied' || room.status === 'paused';

            return (
              <div
                key={room.number}
                className="p-6 transition-colors"
                style={{
                  backgroundColor: isOccupiedOrPaused ? '#fdf2f4' : '#f9fafb'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className="flex items-center justify-center w-16 h-16 rounded-xl font-bold text-2xl"
                      style={{
                        backgroundColor: isOccupiedOrPaused ? '#b01f40' : '#d1d5db',
                        color: isOccupiedOrPaused ? 'white' : '#4b5563'
                      }}
                    >
                      {room.number}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {sq.rooms.room} {room.number}
                      </div>
                      {room.currentPatient && (
                        <div className="mt-1">
                          <div className="text-3xl font-bold text-gray-900">
                            {String(room.currentPatient.queueNumber).padStart(3, '0')}
                          </div>
                        </div>
                      )}
                      {!room.currentPatient && room.status === 'available' && (
                        <div className="text-xl font-semibold text-gray-400 mt-1">
                          {sq.rooms.available}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {room.status === 'occupied' && (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: '#d12b4f' }}
                        ></div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: '#b01f40' }}
                        >
                          {sq.status.inConsultation}
                        </span>
                      </div>
                    )}
                    {room.status === 'paused' && (
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full animate-pulse"
                          style={{ backgroundColor: '#d12b4f' }}
                        ></div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: '#b01f40' }}
                        >
                          {sq.rooms.paused}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(RoomStatus);
