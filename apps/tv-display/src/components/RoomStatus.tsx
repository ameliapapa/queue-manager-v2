import { memo, useState, useEffect, useRef } from 'react';
import { Room } from '../services/dataService';
import { sq } from '../i18n/sq';

interface RoomStatusProps {
  rooms: Room[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function RoomStatus({ rooms }: RoomStatusProps) {
  const [highlightedRooms, setHighlightedRooms] = useState<Set<number>>(new Set());
  const previousRoomsRef = useRef<Map<number, number | undefined>>(new Map());

  // Track room patient changes and trigger animation
  useEffect(() => {
    const newHighlightedRooms = new Set<number>();

    rooms.forEach((room) => {
      const previousPatientId = previousRoomsRef.current.get(room.number);
      const currentPatientId = room.currentPatient?.queueNumber;

      // Detect if a new patient was assigned (patient changed from undefined to a value, or changed to a different patient)
      if (currentPatientId !== undefined && previousPatientId !== currentPatientId) {
        newHighlightedRooms.add(room.number);

        // Remove highlight after 10 seconds
        setTimeout(() => {
          setHighlightedRooms((prev) => {
            const updated = new Set(prev);
            updated.delete(room.number);
            return updated;
          });
        }, 10000);
      }

      // Update previous state
      previousRoomsRef.current.set(room.number, currentPatientId);
    });

    if (newHighlightedRooms.size > 0) {
      setHighlightedRooms((prev) => new Set([...prev, ...newHighlightedRooms]));
    }
  }, [rooms]);

  return (
    <div className="flex flex-col h-full">
      <div className="text-white px-6 py-4" style={{ backgroundColor: '#8B2E42' }}>
        <h2 className="text-3xl font-bold">{sq.rooms.title}</h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="divide-y divide-gray-200">
          {rooms.map((room) => {
            const isOccupiedOrPaused = room.status === 'busy' || room.status === 'paused';
            const isHighlighted = highlightedRooms.has(room.number);

            return (
              <div
                key={room.number}
                className={`p-6 transition-all duration-500 ${isHighlighted ? 'room-highlight' : ''}`}
                style={{
                  backgroundColor: isHighlighted
                    ? '#fef3c7'
                    : isOccupiedOrPaused ? '#fdf2f4' : '#f9fafb'
                }}
              >
                <div className="flex items-center space-x-6">
                  {/* Room label with maroon box */}
                  <div
                    className="flex items-center justify-center space-x-3 rounded-xl px-6 py-4"
                    style={{
                      backgroundColor: isOccupiedOrPaused ? '#b01f40' : '#d1d5db',
                      color: isOccupiedOrPaused ? 'white' : '#4b5563'
                    }}
                  >
                    <div className="text-3xl font-bold">
                      {sq.rooms.room}
                    </div>
                    <div className="text-3xl font-bold">
                      {room.number}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div>
                    {room.status === 'busy' && (
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full animate-pulse"
                          style={{ backgroundColor: '#d12b4f' }}
                        ></div>
                        <span
                          className="text-2xl font-semibold whitespace-nowrap"
                          style={{ color: '#b01f40' }}
                        >
                          {sq.status.inConsultation}
                        </span>
                      </div>
                    )}
                    {room.status === 'paused' && (
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full animate-pulse"
                          style={{ backgroundColor: '#d12b4f' }}
                        ></div>
                        <span
                          className="text-2xl font-semibold whitespace-nowrap"
                          style={{ color: '#b01f40' }}
                        >
                          {sq.rooms.paused}
                        </span>
                      </div>
                    )}
                    {!room.currentPatient && room.status === 'available' && (
                      <div className="text-2xl font-semibold text-gray-400 whitespace-nowrap">
                        {sq.rooms.available}
                      </div>
                    )}
                  </div>

                  {/* Queue number */}
                  {room.currentPatient && (
                    <div className="text-5xl font-bold text-gray-900">
                      {String(room.currentPatient.queueNumber).padStart(3, '0')}
                    </div>
                  )}
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
