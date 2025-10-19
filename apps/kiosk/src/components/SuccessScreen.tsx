import { useEffect } from 'react';
import { sq } from '../i18n/sq';

interface SuccessScreenProps {
  queueNumber: number;
  onTimeout: () => void;
  autoReturnDelay?: number; // milliseconds, default 5000
}

export function SuccessScreen({
  queueNumber,
  onTimeout,
  autoReturnDelay = 5000,
}: SuccessScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTimeout();
    }, autoReturnDelay);

    return () => clearTimeout(timer);
  }, [onTimeout, autoReturnDelay]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: '#8B2E42' }}
    >
      <div className="max-w-2xl w-full text-center">
        {/* Success checkmark animation */}
        <div className="relative mb-8">
          <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg
              className="w-24 h-24 animate-scale-in"
              style={{ color: '#8B2E42' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-white animate-ping opacity-25" />
          </div>
        </div>

        {/* Success message */}
        <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
          {sq.success.title}
        </h1>

        {/* Queue number */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 mb-8 animate-slide-up">
          <p className="text-white text-2xl mb-4">{sq.success.yourNumber}</p>
          <div className="text-8xl font-bold text-white mb-2">
            {String(queueNumber).padStart(3, '0')}
          </div>
          <p className="text-white text-xl opacity-90">
            {sq.success.takePaper}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-8 mb-6 text-left shadow-xl">
          <div className="space-y-4 text-lg text-gray-700">
            <div className="flex items-start">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 flex-shrink-0"
                style={{ backgroundColor: '#fad1d9', color: '#8B2E42' }}
              >
                1
              </span>
              <p>
                {sq.success.takePaper}
              </p>
            </div>

            <div className="flex items-start">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 flex-shrink-0"
                style={{ backgroundColor: '#fad1d9', color: '#8B2E42' }}
              >
                2
              </span>
              <p>
                {sq.success.scanQR}
              </p>
            </div>

            <div className="flex items-start">
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 flex-shrink-0"
                style={{ backgroundColor: '#fad1d9', color: '#8B2E42' }}
              >
                3
              </span>
              <p>
                {sq.idleScreen.assistance}
              </p>
            </div>
          </div>
        </div>

        {/* Auto-return countdown */}
        <p className="text-white text-lg animate-pulse">
          {sq.success.returning} {autoReturnDelay / 1000} {sq.success.seconds}...
        </p>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}
