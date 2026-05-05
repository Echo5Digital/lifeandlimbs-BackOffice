'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import { FormData } from '@/lib/types';
import { formatPhone } from '@/lib/utils';
import StepProgressBar from '@/components/StepForm/StepProgressBar';
import Step1PersonalDetails from '@/components/StepForm/Step1PersonalDetails';
import DocumentUpload, { DocFiles } from '@/components/DocumentUpload/DocumentUpload';
import Step3Review from '@/components/StepForm/Step3Review';

const DEFAULT_FILES: DocFiles = {
  patientPhoto: null,
  housePhoto:   null,
  rationCard:   null,
  aadhaarCard:  null,
  medicalDocs:  null,
};

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<DocFiles>(DEFAULT_FILES);
  const [phoneDisplay, setPhoneDisplay] = useState('+91 ');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      fullName: '', age: '', gender: '', phone: '',
      email: '', district: '', injuryDesc: '',
    },
  });

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhone(val);
    setPhoneDisplay(formatted);
    setValue('phone', formatted.replace(/\s/g, ''));
  };

  const handleFileChange = (
    fieldName: string,
    file: File,
    originalSize: number,
    compressedSize: number,
    preview: string
  ) => {
    setFiles((prev) => ({
      ...prev,
      [fieldName]: { file, originalSize, compressedSize, preview },
    }));
  };

  const goNext = async () => {
    if (step === 1) {
      const valid = await trigger(['fullName', 'age', 'gender', 'phone', 'district', 'injuryDesc']);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const onSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      const data = getValues();
      const form = new window.FormData();

      form.append('fullName',   data.fullName);
      form.append('age',        data.age);
      form.append('gender',     data.gender);
      form.append('phone',      data.phone);
      form.append('email',      data.email || '');
      form.append('district',   data.district);
      form.append('injuryDesc', data.injuryDesc);

      const fileFields = ['patientPhoto', 'housePhoto', 'rationCard', 'aadhaarCard', 'medicalDocs'] as const;
      fileFields.forEach((field) => {
        if (files[field]?.file) {
          form.append(field, files[field]!.file);
        }
      });

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/register`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const { registrationId, registeredAt } = res.data;
      router.push(`/success?id=${registrationId}&at=${encodeURIComponent(registeredAt)}`);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Submission failed. Please try again. · ദയവായി വീണ്ടും ശ്രമിക്കുക.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1A6B3A]">Life and Limbs Foundation</h1>
          <p className="text-sm text-[#9CA3AF] mt-1" lang="ml">രോഗി രജിസ്ട്രേഷൻ</p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden shadow-sm">
          <StepProgressBar current={step} />

          <div className="px-4 pb-4">
            {step === 1 && (
              <Step1PersonalDetails
                register={register}
                errors={errors}
                onPhoneChange={handlePhoneChange}
                phoneValue={phoneDisplay}
              />
            )}

            {step === 2 && (
              <DocumentUpload files={files} onFileChange={handleFileChange} />
            )}

            {step === 3 && (
              <Step3Review formData={getValues()} files={files} />
            )}

            {submitError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-[9px] text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className={`flex mt-6 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 py-3 border border-[#E5E7EB] rounded-[9px] text-base font-medium text-[#374151] bg-white hover:bg-gray-50"
                >
                  ← Back · <span lang="ml">തിരികെ</span>
                </button>
              )}

              {step < 3 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 py-3 bg-[#1A6B3A] text-white rounded-[9px] text-base font-semibold hover:bg-[#155c30] transition-colors"
                >
                  Next → <span lang="ml">അടുത്തത്</span>
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#1A6B3A] text-white rounded-[9px] text-base font-semibold hover:bg-[#155c30] disabled:opacity-60 transition-colors"
                >
                  {submitting
                    ? 'Submitting... · സമർപ്പിക്കുന്നു...'
                    : 'Confirm & Submit · സമർപ്പിക്കുക'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
