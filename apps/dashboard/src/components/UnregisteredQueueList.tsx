import { memo } from 'react';
import { UnregisteredQueue } from '../types';
import { safeFormatDistanceToNow } from '../utils/dateUtils';
import { sq } from '../i18n/sq';

interface UnregisteredQueueListProps {
  queue: UnregisteredQueue[];
  onRegister: (queueNumber: number) => void;
}

// ✅ OPTIMIZED: Wrapped with React.memo
function UnregisteredQueueList({ queue, onRegister }: UnregisteredQueueListProps) {
  // ✅ OPTIMIZED: No need to sort - queue already sorted by createdAt from Firestore

  const isUrgent = (issuedAt: Date) => {
    const minutesAgo = (Date.now() - new Date(issuedAt).getTime()) / 1000 / 60;
    return minutesAgo > 30;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{sq.queue.unregisteredTitle}</h2>
        <span className="bg-primary-100 text-primary-900 px-3 py-1 rounded-full text-sm font-semibold">
          {queue.length}
        </span>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {queue.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>{sq.queue.noPatients}</p>
          </div>
        ) : (
          queue.map((item, index) => {
            const urgent = isUrgent(item.issuedAt);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  urgent
                    ? 'border-red-400 bg-red-50'
                    : index % 2 === 0
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-primary-800 font-mono">
                      {String(item.queueNumber).padStart(3, '0')}
                    </span>
                    {urgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                        I NGUTSHËM
                      </span>
                    )}
                  </div>
                  <span className={`text-sm ${urgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {safeFormatDistanceToNow(item.issuedAt)}
                  </span>
                </div>

                <button
                  onClick={() => onRegister(item.queueNumber)}
                  className="w-full text-white py-2.5 px-4 rounded-lg font-semibold transition-all shadow-sm"
                  style={{ backgroundColor: '#8B2E42' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6b1e2e'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B2E42'}
                >
                  {sq.actions.register}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ✅ OPTIMIZED: Export with React.memo
export default memo(UnregisteredQueueList);
