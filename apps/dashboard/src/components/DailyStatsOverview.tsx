import { useMemo } from 'react';
import { Patient, Assignment } from '../types';
import { formatDuration, intervalToDuration } from 'date-fns';

interface DailyStatsOverviewProps {
  patients: Patient[];
  assignments: Assignment[];
}

export default function DailyStatsOverview({ patients, assignments }: DailyStatsOverviewProps) {
  const stats = useMemo(() => {
    // Get today's completed patients
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedPatients = patients.filter(
      p => p.status === 'completed' &&
      p.completedAt &&
      new Date(p.completedAt) >= today
    );

    const completedCount = completedPatients.length;

    // Calculate average wait time (registration to assigned)
    const waitTimes = completedPatients
      .filter(p => p.registeredAt && p.assignedAt)
      .map(p => {
        const registered = new Date(p.registeredAt!).getTime();
        const assigned = new Date(p.assignedAt!).getTime();
        return (assigned - registered) / 1000 / 60; // minutes
      });

    const avgWaitTime = waitTimes.length > 0
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
      : 0;

    // Calculate average consultation time (assigned to completed)
    const consultationTimes = completedPatients
      .filter(p => p.assignedAt && p.completedAt)
      .map(p => {
        const assigned = new Date(p.assignedAt!).getTime();
        const completed = new Date(p.completedAt!).getTime();
        return (completed - assigned) / 1000 / 60; // minutes
      });

    const avgConsultationTime = consultationTimes.length > 0
      ? consultationTimes.reduce((sum, time) => sum + time, 0) / consultationTimes.length
      : 0;

    // Current queue size
    const currentQueue = patients.filter(p => p.status === 'registered').length;

    // In consultation
    const inConsultation = patients.filter(p => p.status === 'assigned').length;

    return {
      completedCount,
      avgWaitTime: Math.round(avgWaitTime),
      avgConsultationTime: Math.round(avgConsultationTime),
      currentQueue,
      inConsultation,
    };
  }, [patients, assignments]);

  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Today's Overview</h2>
        <div className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="space-y-4">
        {/* Completed Patients */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Average Wait Time */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Avg Wait Time</p>
              <p className="text-sm text-gray-500">Registration → Room</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{formatTime(stats.avgWaitTime)}</p>
            </div>
          </div>
        </div>

        {/* Average Consultation Time */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">Avg Consultation</p>
              <p className="text-sm text-gray-500">Assigned → Completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{formatTime(stats.avgConsultationTime)}</p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-gray-600 mb-1">In Queue</p>
              <p className="text-xl font-bold text-orange-600">{stats.currentQueue}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
              <p className="text-xs text-gray-600 mb-1">In Room</p>
              <p className="text-xl font-bold text-indigo-600">{stats.inConsultation}</p>
            </div>
          </div>
        </div>

        {/* Total Served Today */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Total Served Today</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completedCount + stats.inConsultation}</p>
        </div>
      </div>
    </div>
  );
}
