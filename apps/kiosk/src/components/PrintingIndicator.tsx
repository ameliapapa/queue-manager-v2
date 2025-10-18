interface PrintingIndicatorProps {
  queueNumber?: number;
}

export function PrintingIndicator({ queueNumber }: PrintingIndicatorProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        {/* Animated printer icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-primary-600 animate-bounce"
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
            <div className="w-32 h-32 rounded-full bg-primary-200 animate-ping opacity-25" />
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="w-40 h-40 rounded-full bg-primary-100 animate-ping opacity-20" />
          </div>
        </div>

        {/* Queue number display */}
        {queueNumber && (
          <div className="mb-6">
            <p className="text-gray-600 text-lg mb-2">Your Queue Number</p>
            <div className="text-6xl font-bold text-primary-600 mb-4">
              Q{String(queueNumber).padStart(3, '0')}
            </div>
          </div>
        )}

        {/* Status message */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Printing Your Ticket...
        </h2>

        <p className="text-xl text-gray-600 mb-8">
          Please wait while we print your queue ticket
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full animate-progress" />
        </div>

        {/* Instructions */}
        <div className="bg-primary-50 rounded-lg p-6 mt-8">
          <p className="text-gray-700 text-lg">
            <strong className="text-primary-700">Next steps:</strong>
            <br />
            1. Collect your printed ticket
            <br />
            2. Scan the QR code to register
            <br />
            3. Wait for your number to be called
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
