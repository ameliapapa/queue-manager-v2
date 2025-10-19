import { useEffect, useState } from 'react';
import { HOSPITAL_CONFIG } from '../constants';
import { HospitalLogo } from './HospitalLogo';
import { sq } from '../i18n/sq';

interface IdleScreenProps {
  onWake: () => void;
  queueStats?: {
    totalToday: number;
    pending: number;
    registered: number;
  };
}

export function IdleScreen({ onWake, queueStats }: IdleScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const days = ['E Diel', 'E Hënë', 'E Martë', 'E Mërkurë', 'E Enjte', 'E Premte', 'E Shtunë'];
    const months = ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${monthName} ${year}`;
  };

  const waitingCount = queueStats
    ? queueStats.pending + queueStats.registered
    : 0;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 cursor-pointer"
      style={{
        backgroundColor: '#8B2E42',
      }}
      onClick={onWake}
    >
      {/* Hospital Logo/Name */}
      <div className="text-center mb-12">
        {/* Circular white background - Figma specs */}
        <div
          className="mx-auto mb-6 bg-white flex items-center justify-center"
          style={{
            width: '284px',
            height: '283px',
            borderRadius: '16777200px',
            flexShrink: 0,
          }}
        >
          <HospitalLogo
            className="object-contain"
            style={{ width: '320px', height: '320px', flexShrink: 0 }}
          />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          {sq.idleScreen.hospitalName}
        </h1>
        <p className="text-4xl text-white font-bold">
          {sq.idleScreen.subtitle}
        </p>
      </div>

      {/* Current Time */}
      <div className="text-center mb-12">
        <div className="text-4xl font-bold text-white mb-2">
          {formatTime(currentTime)}
        </div>
        <div className="text-xl text-white">{formatDate(currentTime)}</div>
      </div>

      {/* Touch to Wake */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white bg-opacity-20 mb-4 animate-pulse">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
            />
          </svg>
        </div>
        <p className="text-2xl text-white font-semibold mb-2">
          {sq.idleScreen.touchToGetNumber}
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-primary-100">
        <p className="text-sm">
          {sq.idleScreen.assistance}
        </p>
      </div>
    </div>
  );
}
