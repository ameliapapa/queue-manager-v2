import { memo, useState, useEffect, useRef } from 'react';
import { Room } from '../services/dataService';

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
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div
        className="rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#a03c52', height: '70px' }}
      >
        <h2
          className="text-4xl font-normal text-white text-center"
          style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.5px' }}
        >
          Dhomat e Konsultimit
        </h2>
      </div>

      {/* Room Cards - Grid Layout */}
      <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4">
        {rooms.map((room) => {
          const isHighlighted = highlightedRooms.has(room.number);
          const isBusy = room.status === 'busy';
          const isPaused = room.status === 'paused';
          const isAvailable = room.status === 'available';

          return (
            <div
              key={room.number}
              className="border-4 border-gray-200 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-500"
              style={{
                backgroundColor: '#fafafa'
              }}
            >
              {/* Room name and status */}
              <div className="flex items-center justify-between">
                <h3
                  className="text-4xl font-normal"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#1e2939' }}
                >
                  Dhoma {room.number}
                </h3>

                {/* Status badge */}
                <div
                  className="rounded-xl px-4 py-2"
                  style={{
                    backgroundColor: isAvailable ? '#00c950' : isPaused ? '#99a1af' : '#a03c52',
                    height: '44px'
                  }}
                >
                  <p
                    className="text-xl font-normal text-white whitespace-nowrap"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {isAvailable ? 'E lirë' : isPaused ? 'E Ndërprerë' : 'Në konsultim'}
                  </p>
                </div>
              </div>

              {/* Queue number box */}
              <div
                className={`bg-white rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${
                  isHighlighted ? 'queue-number-highlight' : ''
                }`}
                style={{
                  borderColor: isBusy ? '#a03c52' : '#d1d5dc',
                  height: room.currentPatient ? '85px' : '68px',
                  backgroundColor: isHighlighted ? '#f9e5ea' : 'white'
                }}
              >
                {room.currentPatient ? (
                  <p
                    className="text-5xl font-normal text-center"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      letterSpacing: '2.4px',
                      color: '#a03c52'
                    }}
                  >
                    {String(room.currentPatient.queueNumber).padStart(3, '0')}
                  </p>
                ) : (
                  <p
                    className="text-2xl font-normal text-center"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      color: '#99a1af'
                    }}
                  >
                    - - -
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(RoomStatus);
