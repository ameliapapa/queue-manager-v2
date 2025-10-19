import { memo } from 'react';
import { Patient } from '../services/dataService';

interface RegisteredPatientsProps {
  patients: Patient[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function RegisteredPatients({ patients }: RegisteredPatientsProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-emerald-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">REGISTERED PATIENTS</h2>
        <p className="text-emerald-100 text-sm mt-1">
          Waiting to be called ({patients.length})
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
              <p className="text-sm">No registered patients waiting</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {patients.map((patient, index) => (
              <div
                key={patient.id}
                className={`p-4 hover:bg-emerald-50 transition-colors ${
                  index === 0 ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex items-center justify-center w-14 h-14 rounded-lg font-bold text-xl ${
                        index === 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {String(patient.queueNumber).padStart(3, '0')}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {patient.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {patient.age && patient.gender && (
                          <span>
                            {patient.age} years, {patient.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {index === 0 && (
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Next in line
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(RegisteredPatients);
