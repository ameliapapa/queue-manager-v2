import { useEffect } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Success checkmark animation */}
        <div className="relative mb-8">
          <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg
              className="w-24 h-24 text-green-600 animate-scale-in"
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
          Success!
        </h1>

        {/* Queue number */}
        <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-3xl p-8 mb-8 animate-slide-up">
          <p className="text-white text-2xl mb-4">Your Queue Number</p>
          <div className="text-8xl font-bold text-white mb-2">
            Q{String(queueNumber).padStart(3, '0')}
          </div>
          <p className="text-green-100 text-xl">
            Please save this number
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-8 mb-6 text-left shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-8 h-8 text-green-600 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Please Collect Your Ticket
          </h3>

          <div className="space-y-4 text-lg text-gray-700">
            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4 flex-shrink-0">
                1
              </span>
              <p>
                <strong>Take your printed ticket</strong> from the printer below
              </p>
            </div>

            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4 flex-shrink-0">
                2
              </span>
              <p>
                <strong>Scan the QR code</strong> on your ticket to complete
                registration
              </p>
            </div>

            <div className="flex items-start">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold mr-4 flex-shrink-0">
                3
              </span>
              <p>
                <strong>Wait in the lobby</strong> until your number is called
              </p>
            </div>
          </div>
        </div>

        {/* Auto-return countdown */}
        <p className="text-white text-lg animate-pulse">
          Returning to home screen in {autoReturnDelay / 1000} seconds...
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
