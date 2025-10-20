import { memo } from 'react';
import { Patient } from '../services/dataService';
import { sq } from '../i18n/sq';

interface UnregisteredQueueProps {
  patients: Patient[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function UnregisteredQueue({ patients }: UnregisteredQueueProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-amber-600 text-white px-6 py-4">
        <h2 className="text-3xl font-bold">{sq.queue.unregisteredTitle}</h2>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        {patients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <svg
                className="mx-auto h-12 w-12 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">{sq.queue.noPatients}</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-center p-6 bg-amber-50 border-2 border-amber-300 rounded-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-900">
                      {String(patient.queueNumber).padStart(3, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(UnregisteredQueue);
