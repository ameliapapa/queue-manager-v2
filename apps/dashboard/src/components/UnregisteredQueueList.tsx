import { UnregisteredQueue } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface UnregisteredQueueListProps {
  queue: UnregisteredQueue[];
  onRegister: (queueNumber: number) => void;
}

export default function UnregisteredQueueList({ queue, onRegister }: UnregisteredQueueListProps) {
  const sortedQueue = [...queue].sort((a, b) =>
    new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime()
  );

  const isUrgent = (issuedAt: Date) => {
    const minutesAgo = (Date.now() - new Date(issuedAt).getTime()) / 1000 / 60;
    return minutesAgo > 30;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Unregistered Queue</h2>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
          {queue.length}
        </span>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2">
        {sortedQueue.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>All patients registered</p>
          </div>
        ) : (
          sortedQueue.map((item, index) => {
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
                    <span className="text-2xl font-bold text-orange-600 font-mono">
                      Q{String(item.queueNumber).padStart(3, '0')}
                    </span>
                    {urgent && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                        URGENT
                      </span>
                    )}
                  </div>
                  <span className={`text-sm ${urgent ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                    {item.issuedAt
                      ? formatDistanceToNow(new Date(item.issuedAt), { addSuffix: true })
                      : 'Just now'}
                  </span>
                </div>

                <button
                  onClick={() => onRegister(item.queueNumber)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Complete Registration
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
