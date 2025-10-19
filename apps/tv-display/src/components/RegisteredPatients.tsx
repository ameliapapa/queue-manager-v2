import { memo } from 'react';
import { Patient } from '../services/dataService';
import { sq } from '../i18n/sq';

interface RegisteredPatientsProps {
  patients: Patient[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function RegisteredPatients({ patients }: RegisteredPatientsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-emerald-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">{sq.queue.registeredTitle}</h2>
        <p className="text-emerald-100 text-sm mt-1">
          {sq.queue.waitingPatients} ({patients.length})
        </p>
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
              {patients.map((patient, index) => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-center p-6 rounded-lg border-2 transition-colors ${
                    index === 0
                      ? 'bg-emerald-50 border-emerald-600'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold ${
                        index === 0 ? 'text-emerald-900' : 'text-gray-700'
                      }`}
                    >
                      {String(patient.queueNumber).padStart(3, '0')}
                    </div>
                    {index === 0 && (
                      <div className="text-xs font-medium text-emerald-700 mt-2">
                        {sq.status.next}
                      </div>
                    )}
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
export default memo(RegisteredPatients);
