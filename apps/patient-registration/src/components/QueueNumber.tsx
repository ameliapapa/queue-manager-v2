interface QueueNumberProps {
  queueNumber: number;
}

export default function QueueNumber({ queueNumber }: QueueNumberProps) {
  return (
    <div className="mb-6 bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <p className="text-blue-100 text-sm font-medium text-center">
          Your Queue Number
        </p>
      </div>
      <div className="px-6 py-8 text-center">
        <div className="inline-flex items-center justify-center">
          <span className="text-7xl sm:text-8xl font-bold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Q{String(queueNumber).padStart(3, '0')}
          </span>
        </div>
        <p className="mt-4 text-gray-600 text-sm">
          Please complete your registration below
        </p>
      </div>
    </div>
  );
}
