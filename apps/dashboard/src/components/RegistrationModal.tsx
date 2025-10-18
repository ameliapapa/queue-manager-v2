import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PatientFormData } from '../types';
import { useDashboard } from '../contexts/DashboardContext';

interface RegistrationModalProps {
  queueNumber: number;
  onClose: () => void;
}

export default function RegistrationModal({ queueNumber, onClose }: RegistrationModalProps) {
  const { registerPatient } = useDashboard();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>();

  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);
    try {
      await registerPatient(queueNumber, data);
      onClose();
    } catch (error) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Complete Registration</h2>
              <p className="text-orange-100">
                Queue Number: <span className="font-mono font-bold text-white">
                  Q{String(queueNumber).padStart(3, '0')}
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

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient's full name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  id="age"
                  type="number"
                  {...register('age', {
                    required: 'Age is required',
                    min: { value: 1, message: 'Age must be at least 1' },
                    max: { value: 150, message: 'Please enter a valid age' },
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                />
                {errors.age && <p className="text-red-600 text-sm mt-1">{errors.age.message}</p>}
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  {...register('gender', { required: 'Gender is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="text-red-600 text-sm mt-1">{errors.gender.message}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                id="notes"
                rows={4}
                {...register('notes')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Medical conditions, allergies, or special requirements..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
