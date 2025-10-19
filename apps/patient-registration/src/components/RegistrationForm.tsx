import { useForm } from 'react-hook-form';
import { sq } from '../i18n/sq';

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
        {sq.form.personalInfo}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            {sq.form.fullName} <span style={{ color: '#8B2E42' }}>*</span>
          </label>
          <input
            id="name"
            type="text"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } focus:ring-2 focus:border-transparent transition-all text-base sm:text-lg ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            style={!errors.name && !isSubmitting ? { outlineColor: '#8B2E42' } : {}}
            placeholder={sq.form.fullName}
            {...register('name', {
              required: sq.validation.required,
              minLength: {
                value: 2,
                message: sq.validation.required,
              },
              pattern: {
                value: /^[a-zA-ZëËçÇ\s'-]+$/,
                message: sq.validation.required,
              },
            })}
          />
          {errors.name && (
            <p className="mt-1.5 text-sm" style={{ color: '#8B2E42' }}>{errors.name.message}</p>
          )}
        </div>

        {/* Phone Field */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {sq.form.phoneNumber} <span style={{ color: '#8B2E42' }}>*</span>
          </label>
          <input
            id="phone"
            type="tel"
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
            } focus:ring-2 focus:border-transparent transition-all text-base sm:text-lg ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            style={!errors.phone && !isSubmitting ? { outlineColor: '#8B2E42' } : {}}
            placeholder={sq.form.phoneNumber}
            {...register('phone', {
              required: sq.validation.required,
              pattern: {
                value: /^[0-9+\-\s()]+$/,
                message: sq.validation.invalidPhone,
              },
              minLength: {
                value: 10,
                message: sq.validation.invalidPhone,
              },
            })}
          />
          {errors.phone && (
            <p className="mt-1.5 text-sm" style={{ color: '#8B2E42' }}>{errors.phone.message}</p>
          )}
        </div>

        {/* Age and Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Age Field */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              {sq.form.age} <span style={{ color: '#8B2E42' }}>*</span>
            </label>
            <input
              id="age"
              type="number"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.age ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:border-transparent transition-all text-base sm:text-lg ${
                isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              style={!errors.age && !isSubmitting ? { outlineColor: '#8B2E42' } : {}}
              placeholder={sq.form.age}
              {...register('age', {
                required: sq.validation.required,
                min: {
                  value: 1,
                  message: sq.validation.required,
                },
                max: {
                  value: 150,
                  message: sq.validation.required,
                },
              })}
            />
            {errors.age && (
              <p className="mt-1.5 text-sm" style={{ color: '#8B2E42' }}>{errors.age.message}</p>
            )}
          </div>

          {/* Gender Field */}
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
              {sq.form.gender} <span style={{ color: '#8B2E42' }}>*</span>
            </label>
            <select
              id="gender"
              disabled={isSubmitting}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } focus:ring-2 focus:border-transparent transition-all text-base sm:text-lg ${
                isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              style={!errors.gender && !isSubmitting ? { outlineColor: '#8B2E42' } : {}}
              {...register('gender', {
                required: sq.validation.required,
              })}
            >
              <option value="">{sq.form.gender}</option>
              <option value="male">{sq.form.male}</option>
              <option value="female">{sq.form.female}</option>
              <option value="other">{sq.form.other}</option>
            </select>
            {errors.gender && (
              <p className="mt-1.5 text-sm" style={{ color: '#8B2E42' }}>{errors.gender.message}</p>
            )}
          </div>
        </div>

        {/* Notes Field (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            {sq.form.notes}
          </label>
          <textarea
            id="notes"
            rows={4}
            disabled={isSubmitting}
            className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:border-transparent transition-all text-base resize-none ${
              isSubmitting ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            style={!isSubmitting ? { outlineColor: '#8B2E42' } : {}}
            placeholder={sq.form.notes}
            {...register('notes', {
              maxLength: {
                value: 500,
                message: sq.validation.required,
              },
            })}
          />
          {errors.notes && (
            <p className="mt-1.5 text-sm" style={{ color: '#8B2E42' }}>{errors.notes.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          style={{ backgroundColor: '#8B2E42' }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {sq.loading.submitting}
            </span>
          ) : (
            sq.actions.submit
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          {sq.privacy.message}
        </p>
      </form>
    </div>
  );
}
