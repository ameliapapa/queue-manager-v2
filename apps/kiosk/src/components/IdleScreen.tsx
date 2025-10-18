import { useEffect, useState } from 'react';
import { HOSPITAL_CONFIG } from '../constants';

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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const waitingCount = queueStats
    ? queueStats.pending + queueStats.registered
    : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex flex-col items-center justify-center p-8 cursor-pointer"
      onClick={onWake}
    >
      {/* Hospital Logo/Name */}
      <div className="text-center mb-12">
        <div className="w-32 h-32 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
          <svg
            className="w-20 h-20 text-primary-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          {HOSPITAL_CONFIG.name}
        </h1>
        <p className="text-2xl text-primary-100">Queue Management System</p>
      </div>

      {/* Current Time */}
      <div className="text-center mb-12">
        <div className="text-6xl font-bold text-white mb-2">
          {formatTime(currentTime)}
        </div>
        <div className="text-xl text-primary-100">{formatDate(currentTime)}</div>
      </div>

      {/* Queue Status */}
      {queueStats && (
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 mb-12 min-w-[400px]">
          <div className="text-center">
            <p className="text-primary-100 text-lg mb-4">Current Queue Status</p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-4xl font-bold text-white mb-2">
                  {waitingCount}
                </div>
                <div className="text-primary-100">Waiting</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white mb-2">
                  {queueStats.totalToday}
                </div>
                <div className="text-primary-100">Today</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          Touch anywhere to get your queue number
        </p>
        <p className="text-lg text-primary-100">
          Fast, easy, and contactless service
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-primary-100">
        <p className="text-sm">
          For assistance, please contact reception
        </p>
      </div>
    </div>
  );
}
