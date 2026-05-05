'use client';

interface Step {
  label: string;
  ml: string;
}

const steps: Step[] = [
  { label: 'Personal Details', ml: 'വ്യക്തിഗത വിവരങ്ങൾ' },
  { label: 'Documents Upload', ml: 'രേഖകൾ അപ്‌ലോഡ് ചെയ്യുക' },
  { label: 'Review & Submit', ml: 'അവലോകനം & സമർപ്പിക്കുക' },
  { label: 'Done', ml: 'പൂർത്തിയായി' },
];

export default function StepProgressBar({ current }: { current: number }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive    = stepNum === current;
        const isCompleted = stepNum < current;

        return (
          <button
            key={idx}
            type="button"
            disabled
            className={`
              flex-1 py-3 px-2 text-center border-b-2 transition-colors
              ${isActive    ? 'border-[#1A6B3A] text-[#1A6B3A] font-semibold' : ''}
              ${isCompleted ? 'border-[#86EFAC] text-[#16A34A]' : ''}
              ${!isActive && !isCompleted ? 'border-transparent text-gray-400' : ''}
            `}
          >
            <div className="text-sm font-medium leading-tight">{step.label}</div>
            <div className="text-[11px] mt-0.5" lang="ml">{step.ml}</div>
          </button>
        );
      })}
    </div>
  );
}
