interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}

export function ErrorScreen({ error, onRetry, onCancel }: ErrorScreenProps) {
  // Determine error type for custom messaging
  const isQueueFull = error.toLowerCase().includes('full');
  const isNetworkError =
    error.toLowerCase().includes('unavailable') ||
    error.toLowerCase().includes('network');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Error icon */}
        <div className="relative mb-8">
          <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <svg
              className="w-24 h-24 text-red-600 animate-shake"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Error title */}
        <h1 className="text-5xl font-bold text-white mb-6">
          {isQueueFull ? 'Queue Full' : 'Oops! Something Went Wrong'}
        </h1>

        {/* Error message */}
        <div className="bg-white rounded-2xl p-8 mb-8 shadow-xl">
          <div className="flex items-start mb-6">
            <svg
              className="w-8 h-8 text-red-600 mr-4 flex-shrink-0 mt-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-left flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Error Details
              </h3>
              <p className="text-lg text-gray-700">{error}</p>
            </div>
          </div>

          {/* Recovery instructions */}
          <div className="bg-red-50 rounded-lg p-6 text-left">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <svg
                className="w-6 h-6 text-red-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              What to do next:
            </h4>

            {isQueueFull ? (
              <div className="space-y-2 text-gray-700">
                <p>• The queue has reached maximum capacity for today</p>
                <p>• Please try again tomorrow</p>
                <p>• Or contact reception for urgent matters</p>
              </div>
            ) : isNetworkError ? (
              <div className="space-y-2 text-gray-700">
                <p>• Check your internet connection</p>
                <p>• Try again in a few moments</p>
                <p>• Contact reception if the problem persists</p>
              </div>
            ) : (
              <div className="space-y-2 text-gray-700">
                <p>• Try pressing the retry button below</p>
                <p>• If the error continues, please contact reception</p>
                <p>• Our staff will be happy to assist you</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center mb-6">
          {!isQueueFull && (
            <button
              onClick={onRetry}
              className="
                px-12 py-5
                bg-white
                hover:bg-gray-100
                active:bg-gray-200
                text-red-600
                font-bold
                text-xl
                rounded-xl
                shadow-lg
                transition-all
                duration-200
                hover:scale-105
                active:scale-95
                flex items-center
              "
            >
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          )}

          <button
            onClick={onCancel}
            className="
              px-12 py-5
              bg-white bg-opacity-20
              hover:bg-opacity-30
              active:bg-opacity-40
              text-white
              font-bold
              text-xl
              rounded-xl
              border-2 border-white
              shadow-lg
              transition-all
              duration-200
              hover:scale-105
              active:scale-95
              flex items-center
            "
          >
            <svg
              className="w-6 h-6 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>

        {/* Contact info */}
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 text-white">
          <h4 className="font-bold text-xl mb-2">Need Immediate Help?</h4>
          <p className="text-lg">
            Please visit the reception desk or call for assistance
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
