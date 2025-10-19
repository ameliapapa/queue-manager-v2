import { sq } from '../i18n/sq';

interface QueueNumberProps {
  queueNumber: number;
}

export default function QueueNumber({ queueNumber }: QueueNumberProps) {
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4" style={{ backgroundColor: '#8B2E42' }}>
        <p className="text-white text-sm font-medium text-center opacity-90">
          {sq.welcome.queueNumber}
        </p>
      </div>
      <div className="px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center">
          <span className="text-7xl sm:text-8xl font-bold" style={{ color: '#8B2E42' }}>
            {String(queueNumber).padStart(3, '0')}
          </span>
        </div>
        <p className="mt-4 text-gray-600 text-sm">
          {sq.welcome.subtitle}
        </p>
      </div>
    </div>
  );
}
