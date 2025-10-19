import { memo } from 'react';
import { Room } from '../types';
import { useDashboard } from '../contexts/DashboardContext';
import { sq } from '../i18n/sq';

interface RoomCardProps {
  room: Room;
  onAssignNext: () => void;
}

// ✅ OPTIMIZED: Wrapped with React.memo
function RoomCard({ room, onAssignNext }: RoomCardProps) {
  const { completeConsultation, toggleRoomPause } = useDashboard();

  const statusColors = {
    available: 'bg-green-100 border-green-500 text-green-800',
    busy: 'bg-primary-100 border-primary-800 text-primary-900',
    paused: 'bg-yellow-100 border-yellow-500 text-yellow-800',
  };

  const statusLabels = {
    available: sq.rooms.available,
    busy: sq.rooms.occupied,
    paused: sq.rooms.paused,
  };

  const handleComplete = async () => {
    if (window.confirm(sq.alerts.completeConfirm.replace('{name}', room.currentPatient?.name || ''))) {
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
          <h3 className="text-lg font-bold">{sq.rooms.room} {room.roomNumber}</h3>
          <p className="text-sm opacity-80">{room.doctorName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            room.status === 'available' ? 'bg-green-500' :
            room.status === 'busy' ? 'bg-primary-800' : 'bg-yellow-500'
          } animate-pulse`}></div>
          <span className="text-sm font-semibold">{statusLabels[room.status]}</span>
        </div>
      </div>

      {/* Current Patient */}
      <div className="mb-4 min-h-[60px]">
        {room.currentPatient ? (
          <div className="bg-white bg-opacity-50 rounded-lg p-3">
            <p className="text-xs font-medium opacity-70 mb-1">{sq.rooms.currentPatient}</p>
            <p className="font-bold">{room.currentPatient.name}</p>
            <p className="text-sm">
              {sq.queue.queueNumber}: <span className="font-mono font-semibold">
                {String(room.currentPatient.queueNumber).padStart(3, '0')}
              </span>
            </p>
          </div>
        ) : (
          <div className="bg-white bg-opacity-30 rounded-lg p-3 text-center">
            <p className="text-sm opacity-60">{sq.rooms.noPatient}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {room.status === 'available' && (
          <button
            onClick={onAssignNext}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-all shadow-sm"
          >
            {sq.rooms.assignNext}
          </button>
        )}

        {room.status === 'busy' && (
          <button
            onClick={handleComplete}
            className="w-full text-white py-2.5 px-4 rounded-lg font-semibold transition-all shadow-sm"
            style={{ backgroundColor: '#8B2E42' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b1e2e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B2E42'}
          >
            {sq.rooms.complete}
          </button>
        )}

        {room.status !== 'busy' && (
          <button
            onClick={handlePause}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-900 py-2.5 px-4 rounded-lg font-semibold transition-all shadow-sm"
          >
            {room.status === 'paused' ? sq.rooms.resume : sq.rooms.pause}
          </button>
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo
export default memo(RoomCard);
