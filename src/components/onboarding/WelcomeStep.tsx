import { Button } from '../shared/Button';
import { ArrowRight } from 'lucide-react';

interface Props {
  businessName: string;
  onContinue: () => void;
}

export function WelcomeStep({ businessName, onContinue }: Props) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-6">&#x1F389;</div>
      <h2 className="text-3xl font-extrabold text-neutral-800 mb-3">
        Welcome aboard!
      </h2>
      <p className="text-neutral-500 text-lg mb-2">
        <strong>{businessName}</strong> is ready to go.
      </p>
      <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8">
        Start by scanning a pet&apos;s QR code or searching by pet ID to link your first patient.
        You can manage records, send reminders, and track your practice from the dashboard.
      </p>
      <Button onClick={onContinue} size="lg" icon={<ArrowRight size={20} />}>
        Go to Dashboard
      </Button>
    </div>
  );
}
