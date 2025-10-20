import { memo } from 'react';
import { Patient } from '../services/dataService';
import { sq } from '../i18n/sq';

interface UnregisteredQueueProps {
  patients: Patient[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function UnregisteredQueue({ patients }: UnregisteredQueueProps) {
  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div
        className="rounded-2xl mb-6 flex items-center justify-center"
        style={{ backgroundColor: '#d15600', height: '83px' }}
      >
        <h2
          className="text-4xl font-normal text-white text-center"
          style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.5px' }}
        >
          Të Paregjistruar
        </h2>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3">
        {patients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <p className="text-sm">{sq.queue.noPatients}</p>
            </div>
          </div>
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-gray-100 rounded-xl px-4 py-4 flex items-center justify-center"
              style={{ height: '80px' }}
            >
              <p
                className="text-5xl font-normal text-center"
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '2.4px',
                  color: '#1e2939'
                }}
              >
                {String(patient.queueNumber).padStart(3, '0')}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(UnregisteredQueue);
