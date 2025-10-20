import { memo } from 'react';
import { Patient } from '../services/dataService';
import { sq } from '../i18n/sq';

interface RegisteredPatientsProps {
  patients: Patient[];
}

// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders
function RegisteredPatients({ patients }: RegisteredPatientsProps) {
  return (
    <div className="flex flex-col h-full p-5">
      {/* Header */}
      <div
        className="rounded-2xl mb-5 flex items-center justify-center"
        style={{ backgroundColor: '#007c31', height: '70px' }}
      >
        <h2
          className="text-4xl font-normal text-white text-center"
          style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '0.5px' }}
        >
          Të Regjistruar
        </h2>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
        {patients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <p className="text-sm">{sq.queue.noPatients}</p>
            </div>
          </div>
        ) : (
          patients.map((patient, index) => (
            <div key={patient.id}>
              {index === 0 ? (
                <div
                  className="rounded-xl px-4 py-4 shadow-lg flex flex-col items-center justify-center gap-2"
                  style={{ backgroundColor: '#40ae6c', opacity: 0.792, height: '122px' }}
                >
                  <p
                    className="text-5xl font-normal text-black text-center"
                    style={{
                      fontFamily: 'Poppins, sans-serif',
                      letterSpacing: '2.4px'
                    }}
                  >
                    {String(patient.queueNumber).padStart(3, '0')}
                  </p>
                  <p
                    className="text-xl font-medium text-black text-center"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Pacienti i rradhes
                  </p>
                </div>
              ) : (
                <div
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo to prevent unnecessary re-renders
export default memo(RegisteredPatients);
