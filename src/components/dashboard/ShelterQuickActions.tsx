import { useNavigate } from 'react-router-dom';
import { ClipboardPlus, Megaphone } from 'lucide-react';

export function ShelterQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-800 mb-3">Quick Actions</h3>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/intake/new')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-portal-primary-500 text-white font-semibold text-sm hover:bg-portal-primary-600 transition-colors"
        >
          <ClipboardPlus size={18} />
          New Intake
        </button>
        <button
          onClick={() => navigate('/listings/new')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-portal-primary-500 text-portal-primary-600 font-semibold text-sm hover:bg-portal-primary-50 transition-colors"
        >
          <Megaphone size={18} />
          Create Listing
        </button>
      </div>
    </div>
  );
}
