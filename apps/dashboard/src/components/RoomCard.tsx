import { memo } from 'react';
import { Room } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface RoomCardProps {
  room: Room;
  onAssignNext: () => void;
}

// ✅ OPTIMIZED: Wrapped with React.memo
function RoomCard({ room, onAssignNext }: RoomCardProps) {
  const { completeConsultation, toggleRoomPause } = useDashboard();

  const statusColors = {
    available: 'bg-green-100 border-green-500 text-green-800',
    busy: 'bg-blue-100 border-blue-500 text-blue-800',
    paused: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };

  const statusLabels = {
    available: 'Available',
    busy: 'Busy',
    paused: 'Paused',
  };

  const handleComplete = async () => {
    if (window.confirm('Mark consultation as complete?')) {
      try {
        await completeConsultation(room.id);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handlePause = async () => {
    try {
      await toggleRoomPause(room.id);
    } catch (error) {
      // Error handled by context
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${statusColors[room.status]} transition-all`}>
      {/* Room Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold">Room {room.roomNumber}</h3>
          <p className="text-sm opacity-80">{room.doctorName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            room.status === 'available' ? 'bg-green-500' :
            room.status === 'busy' ? 'bg-blue-500' : 'bg-yellow-500'
          } animate-pulse`}></div>
          <span className="text-sm font-semibold">{statusLabels[room.status]}</span>
        </div>
      </div>

      {/* Current Patient */}
      <div className="mb-4 min-h-[60px]">
        {room.currentPatient ? (
          <div className="bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-xs font-medium opacity-70 mb-1">Current Patient</p>
            <p className="font-bold">{room.currentPatient.name}</p>
            <p className="text-sm">
              Queue: <span className="font-mono font-semibold">
                Q{String(room.currentPatient.queueNumber).padStart(3, '0')}
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-white bg-opacity-30 rounded-lg p-3 text-center">
            <p className="text-sm opacity-60">No patient</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {room.status === 'available' && (
          <button
            onClick={onAssignNext}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
          >
            Assign Next
          </button>
        )}

        {room.status === 'busy' && (
          <button
            onClick={handleComplete}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
          >
            Complete
          </button>
        )}

        {room.status !== 'busy' && (
          <button
            onClick={handlePause}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-all"
          >
            {room.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo
export default memo(RoomCard);
