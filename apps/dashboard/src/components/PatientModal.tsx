import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Patient, PatientFormData } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface PatientModalProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientModal({ patient, onClose }: PatientModalProps) {
  const { updatePatient, cancelPatient } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    defaultValues: {
      name: patient.name,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      notes: patient.notes || '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      await updatePatient(patient.id, data);
      setIsEditing(false);
      onClose();
    } catch (error) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Reason for cancellation:');
    if (reason) {
      try {
        await cancelPatient(patient.id, reason);
        onClose();
      } catch (error) {
        // Error handled by context
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Patient Details</h2>
              <p className="text-blue-100">
                Queue Number: <span className="font-mono font-bold text-white">
                  Q{String(patient.queueNumber).padStart(3, '0')}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              {isEditing ? (
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{patient.name}</p>
              )}
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              {isEditing ? (
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-lg text-gray-900">{patient.phone}</p>
              )}
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    {...register('age', { required: 'Age is required', min: 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{patient.age} years</p>
                )}
                {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                {isEditing ? (
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-lg text-gray-900 capitalize">{patient.gender}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              {isEditing ? (
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{patient.notes || 'No notes'}</p>
              )}
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{patient.status}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
            >
              Cancel Patient
            </button>

            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  Edit Details
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
