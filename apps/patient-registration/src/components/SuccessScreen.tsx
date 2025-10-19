import { sq } from '../i18n/sq';

interface SuccessScreenProps {
  queueNumber: number;
}

export default function SuccessScreen({ queueNumber }: SuccessScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#fdf2f4' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ backgroundColor: '#fce7eb' }}>
            <svg className="w-10 h-10" style={{ color: '#8B2E42' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">
            {sq.success.title}
          </h2>
          <p className="text-gray-600 text-center">
            {sq.success.thankYou}
          </p>
        </div>

        {/* Queue Number Display */}
        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#fdf2f4' }}>
          <p className="text-sm text-gray-600 text-center mb-2">
            {sq.success.queueNumber}
          </p>
          <div className="text-center">
            <span className="text-6xl font-bold" style={{ color: '#8B2E42' }}>
              {String(queueNumber).padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#fad1d9' }}>
              <span style={{ color: '#8B2E42' }} className="font-semibold text-sm">1</span>
            </div>
            <div>
              <p className="text-gray-700 font-medium">{sq.success.instructions}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="border rounded-xl p-4" style={{ backgroundColor: '#fce7eb', borderColor: '#fad1d9' }}>
          <div className="flex items-start">
            <svg className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0" style={{ color: '#8B2E42' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium" style={{ color: '#8B2E42' }}>{sq.success.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
