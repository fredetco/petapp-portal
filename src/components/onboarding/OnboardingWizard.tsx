import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../../context/PortalAuthContext';
import { createBusiness, INITIAL_ONBOARDING, type OnboardingData } from '../../services/onboarding';
import { BusinessTypeStep } from './BusinessTypeStep';
import { BusinessDetailsStep } from './BusinessDetailsStep';
import { LocationStep } from './LocationStep';
import { PlanSelectionStep } from './PlanSelectionStep';
import { WelcomeStep } from './WelcomeStep';
import { ChevronLeft } from 'lucide-react';

const STEPS = ['Type', 'Details', 'Location', 'Plan', 'Welcome'] as const;

export function OnboardingWizard() {
  const { user, refreshBusiness } = usePortalAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleComplete = async () => {
    if (!user) return;
    setError('');
    setLoading(true);
    try {
      await createBusiness(data, user.id);
      await refreshBusiness();
      next(); // Go to welcome step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
      setLoading(false);
    }
  };

  const goToDashboard = () => navigate('/', { replace: true });

  return (
    <div className="min-h-screen bg-portal-bg flex flex-col">
      {/* Progress */}
      {step < 4 && (
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              {step > 0 && (
                <button onClick={back} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700">
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <span className="text-sm text-neutral-500 ml-auto">
                Step {step + 1} of 4
              </span>
            </div>
            <div className="flex gap-2">
              {STEPS.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-portal-primary-500' : 'bg-neutral-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto w-full px-4 mt-4">
          <div className="bg-danger/10 text-danger text-sm rounded-xl p-3">{error}</div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {step === 0 && <BusinessTypeStep data={data} onChange={updateData} onNext={next} />}
          {step === 1 && <BusinessDetailsStep data={data} onChange={updateData} onNext={next} />}
          {step === 2 && <LocationStep data={data} onChange={updateData} onNext={next} />}
          {step === 3 && <PlanSelectionStep data={data} onChange={updateData} onSubmit={handleComplete} loading={loading} />}
          {step === 4 && <WelcomeStep businessName={data.name} onContinue={goToDashboard} />}
        </div>
      </div>
    </div>
  );
}
