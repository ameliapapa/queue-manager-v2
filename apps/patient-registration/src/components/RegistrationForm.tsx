import { useForm } from 'react-hook-form';

interface FormData {
  name: string;
  phone: string;
  age: string;
  gender: string;
  notes: string;
}

interface RegistrationFormProps {
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
}

export default function RegistrationForm({ onSubmit, isSubmitting }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
        Patient Information
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter your full name"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
              pattern: {
                value: /^[a-zA-Z\s'-]+$/,
                message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
              },
            })}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Enter your phone number"
            {...register('phone', {
              required: 'Phone number is required',
              pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: 'Please enter a valid phone number',
              },
              minLength: {
                value: 10,
                message: 'Phone number must be at least 10 digits',
              },
            })}
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Age and Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Age Field */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              id="age"
              type="number"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg ${
                isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Age"
              {...register('age', {
                required: 'Age is required',
                min: {
                  value: 1,
                  message: 'Age must be at least 1',
                },
                max: {
                  value: 150,
                  message: 'Please enter a valid age',
                },
              })}
            />
            {errors.age && (
              <p className="mt-1.5 text-sm text-red-600">{errors.age.message}</p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base sm:text-lg ${
                isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              {...register('gender', {
                required: 'Gender is required',
              })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1.5 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Notes Field (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="notes"
            rows={4}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base resize-none ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Any medical conditions, allergies, or special requirements..."
            {...register('notes', {
              maxLength: {
                value: 500,
                message: 'Notes cannot exceed 500 characters',
              },
            })}
          />
          {errors.notes && (
            <p className="mt-1.5 text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            'Complete Registration'
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          Your information is secure and will only be used for medical purposes
        </p>
      </form>
    </div>
  );
}
