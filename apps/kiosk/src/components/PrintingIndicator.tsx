import { sq } from '../i18n/sq';

interface PrintingIndicatorProps {
  queueNumber?: number;
}

export function PrintingIndicator({ queueNumber }: PrintingIndicatorProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Animated printer icon */}
        <div className="relative mb-8">
          <div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#fad1d9' }}
          >
            <svg
              className="w-16 h-16 animate-bounce"
              style={{ color: '#8B2E42' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </div>

          {/* Pulsing rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-32 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: '#fad1d9' }}
            />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animationDelay: '0.5s' }}
          >
            <div
              className="w-40 h-40 rounded-full animate-ping opacity-20"
              style={{ backgroundColor: '#fce7eb' }}
            />
          </div>
        </div>

        {/* Queue number display */}
        {queueNumber && (
          <div className="mb-6">
            <p className="text-gray-600 text-lg mb-2">{sq.success.yourNumber}</p>
            <div
              className="text-6xl font-bold mb-4"
              style={{ color: '#8B2E42' }}
            >
              {String(queueNumber).padStart(3, '0')}
            </div>
          </div>
        )}

        {/* Status message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {sq.printing.title}
        </h2>

        <p className="text-xl text-gray-600 mb-8">
          {sq.printing.subtitle}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="h-full rounded-full animate-progress"
            style={{ backgroundColor: '#8B2E42' }}
          />
        </div>

        {/* Instructions */}
        <div
          className="rounded-lg p-6 mt-8"
          style={{ backgroundColor: '#fdf2f4' }}
        >
          <p className="text-gray-700 text-lg">
            <strong style={{ color: '#8B2E42' }}>{sq.printing.almostDone}</strong>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 70%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
