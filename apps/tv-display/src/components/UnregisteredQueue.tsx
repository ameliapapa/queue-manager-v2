import { Patient } from '../services/dataService';

interface UnregisteredQueueProps {
  patients: Patient[];
}

export default function UnregisteredQueue({ patients }: UnregisteredQueueProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-amber-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">UNREGISTERED QUEUE</h2>
        <p className="text-amber-100 text-sm mt-1">
          Please complete registration ({patients.length})
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
              <p className="text-sm">All patients have registered</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-center p-4 bg-amber-50 border-2 border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-900">
                      Q{String(patient.queueNumber).padStart(3, '0')}
                    </div>
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                      Scan QR Code
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {patients.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Registration Required</p>
                    <p className="mt-1">
                      Please scan the QR code on your ticket using your mobile device
                      to complete registration before seeing the doctor.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
