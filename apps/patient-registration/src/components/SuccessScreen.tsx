interface SuccessScreenProps {
  queueNumber: number;
}

export default function SuccessScreen({ queueNumber }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            Registration Complete!
          </h2>
          <p className="text-gray-600 text-center">
            Thank you for registering
          </p>
        </div>

        {/* Queue Number Display */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600 text-center mb-2">
            Your Queue Number
          </p>
          <div className="text-center">
            <span className="text-6xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Q{String(queueNumber).padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Wait in the waiting area</p>
              <p className="text-sm text-gray-500">Please remain seated in the designated area</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Watch the display screen</p>
              <p className="text-sm text-gray-500">Your number will be called when ready</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">Proceed to the counter</p>
              <p className="text-sm text-gray-500">When your number is displayed</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Important</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please have your ID ready when called. Average wait time is 15-30 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => window.close()}
          className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium transition-all"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
