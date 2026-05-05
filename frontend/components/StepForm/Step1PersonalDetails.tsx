'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/types';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onPhoneChange: (val: string) => void;
  phoneValue: string;
}

function Field({
  label, ml, children, error,
}: {
  label: React.ReactNode; ml: string; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block mb-1">
        <span className="block text-sm font-medium text-[#374151]">{label}</span>
        <span className="block text-xs text-[#9CA3AF]" lang="ml">{ml}</span>
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

const inputClass = `
  w-full h-11 px-3 border border-[#E5E7EB] rounded-[9px] text-base
  focus:outline-none focus:ring-2 focus:ring-[#1A6B3A] focus:border-transparent
  bg-white text-[#374151]
`;

export default function Step1PersonalDetails({ register, errors, onPhoneChange, phoneValue }: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-[#374151] mb-4">
        Personal Details{' '}
        <span className="text-base font-normal text-[#9CA3AF]" lang="ml">വ്യക്തിഗത വിവരങ്ങൾ</span>
      </h2>

      <Field label="Full Name" ml="പൂർണ്ണ നാമം" error={errors.fullName?.message}>
        <input
          type="text"
          placeholder="Full Name · പൂർണ്ണ നാമം"
          className={inputClass}
          {...register('fullName', { required: 'Full name is required · പൂർണ്ണ നാമം ആവശ്യമാണ്' })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" ml="പ്രായം" error={errors.age?.message}>
          <input
            type="number"
            placeholder="Age · പ്രായം"
            min={1}
            max={120}
            className={inputClass}
            {...register('age', {
              required: 'Age is required · പ്രായം ആവശ്യമാണ്',
              min: { value: 1, message: 'Enter a valid age' },
              max: { value: 120, message: 'Enter a valid age' },
            })}
          />
        </Field>

        <Field label="Gender" ml="ലിംഗം" error={errors.gender?.message}>
          <select
            className={inputClass}
            {...register('gender', { required: 'Gender is required · ലിംഗം ആവശ്യമാണ്' })}
          >
            <option value="">Select · തിരഞ്ഞെടുക്കുക</option>
            <option value="male">Male · പുരുഷൻ</option>
            <option value="female">Female · സ്ത്രീ</option>
            <option value="other">Other · മറ്റ്</option>
          </select>
        </Field>
      </div>

      <Field label="Phone Number" ml="ഫോൺ നമ്പർ" error={errors.phone?.message}>
        <input
          type="tel"
          value={phoneValue}
          placeholder="+91 · ഫോൺ നമ്പർ"
          className={inputClass}
          onChange={(e) => onPhoneChange(e.target.value)}
        />
        {/* Hidden input to register with react-hook-form */}
        <input type="hidden" {...register('phone', { required: 'Phone number is required · ഫോൺ നമ്പർ ആവശ്യമാണ്' })} />
      </Field>

      <Field
        label={
          <>
            Email{' '}
            <span className="ml-1 inline-block px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded-full align-middle">
              Optional · ഐച്ഛികം
            </span>
          </>
        }
        ml="ഇ-മെയിൽ (ഐച്ഛികം)"
        error={errors.email?.message}
      >
        <input
          type="email"
          placeholder="Email · ഇ-മെയിൽ (Optional)"
          className={inputClass}
          {...register('email', {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          })}
        />
      </Field>

      <Field label="District / Address" ml="ജില്ല / വിലാസം" error={errors.district?.message}>
        <input
          type="text"
          placeholder="District / Address · ജില്ല / വിലാസം"
          className={inputClass}
          {...register('district', { required: 'District is required · ജില്ല ആവശ്യമാണ്' })}
        />
      </Field>

      <Field label="Injury Description" ml="പരിക്കിന്റെ വിവരണം" error={errors.injuryDesc?.message}>
        <textarea
          rows={4}
          placeholder="Describe the injury · പരിക്കിന്റെ വിവരണം"
          className={`${inputClass} h-auto py-2 resize-none`}
          {...register('injuryDesc', { required: 'Injury description is required · പരിക്കിന്റെ വിവരണം ആവശ്യമാണ്' })}
        />
      </Field>
    </div>
  );
}
