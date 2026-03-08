import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PortalHeader } from '../layout/PortalHeader';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { Button } from '../shared/Button';
import {
  createShelterAnimal,
  calculateCareComplexity,
  INITIAL_INTAKE,
  type IntakeFormData,
} from '../../services/shelterAnimals';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { IntakeDetailsStep } from './steps/IntakeDetailsStep';
import { HealthBehaviorStep } from './steps/HealthBehaviorStep';
import { PhotosStep } from './steps/PhotosStep';
import { CareComplexityStep } from './steps/CareComplexityStep';
import { ReviewStep } from './steps/ReviewStep';

const STEP_LABELS = ['Basic Info', 'Intake Details', 'Health & Behavior', 'Photos', 'Care Complexity', 'Review'];

export function IntakeFormPage() {
  const navigate = useNavigate();
  const { business } = usePortalAuth();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(INITIAL_INTAKE);

  const onChange = (partial: Partial<IntakeFormData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const mutation = useMutation({
    mutationFn: () => createShelterAnimal(business!.id, data),
    onSuccess: (animal) => {
      queryClient.invalidateQueries({ queryKey: ['shelter-animals'] });
      queryClient.invalidateQueries({ queryKey: ['shelter-dashboard-stats'] });
      navigate(`/intake/${animal.id}`);
    },
  });

  const next = () => {
    if (step === 3) {
      // After photos step, auto-calculate care complexity
      onChange({ care_complexity_score: calculateCareComplexity(data) });
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0: return <BasicInfoStep data={data} onChange={onChange} />;
      case 1: return <IntakeDetailsStep data={data} onChange={onChange} />;
      case 2: return <HealthBehaviorStep data={data} onChange={onChange} />;
      case 3: return <PhotosStep data={data} onChange={onChange} shelterId={business!.id} />;
      case 4: return <CareComplexityStep data={data} onChange={onChange} />;
      case 5: return <ReviewStep data={data} />;
      default: return null;
    }
  };

  return (
    <>
      <PortalHeader title="New Animal Intake" />

      <div className="p-6 max-w-2xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full h-1.5 rounded-full transition-colors ${
                  i <= step ? 'bg-portal-primary-500' : 'bg-neutral-200'
                }`}
              />
              <span className={`text-xs font-medium ${i <= step ? 'text-portal-primary-600' : 'text-neutral-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={step === 0 ? () => navigate('/intake') : back}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>

          {step < STEP_LABELS.length - 1 ? (
            <Button onClick={next}>Continue</Button>
          ) : (
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Animal'}
            </Button>
          )}
        </div>

        {mutation.isError && (
          <p className="mt-4 text-sm text-red-600 text-center">
            Failed to save: {(mutation.error as Error).message}
          </p>
        )}
      </div>
    </>
  );
}
