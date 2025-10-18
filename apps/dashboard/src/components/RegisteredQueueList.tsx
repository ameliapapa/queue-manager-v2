import { useState } from 'react';
import { Patient } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface RegisteredQueueListProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

export default function RegisteredQueueList({ patients, onPatientClick }: RegisteredQueueListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.queueNumber.toString().includes(searchTerm)
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const timeA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
    const timeB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
    return timeA - timeB;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Registered Patients</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          {filteredPatients.length}
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or queue number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Patient List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {sortedPatients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>No registered patients</p>
          </div>
        ) : (
          sortedPatients.map((patient, index) => (
            <div
              key={patient.id}
              onClick={() => onPatientClick(patient)}
              className={`p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-lg font-bold text-blue-600 font-mono">
                      Q{String(patient.queueNumber).padStart(3, '0')}
                    </span>
                    <span className="text-lg font-semibold text-gray-900">
                      {patient.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{patient.age} years</span>
                    <span className="capitalize">{patient.gender}</span>
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {patient.registeredAt
                        ? formatDistanceToNow(new Date(patient.registeredAt), { addSuffix: true })
                        : 'Just now'}
                    </span>
                  </div>
                  {patient.notes && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{patient.notes}</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
