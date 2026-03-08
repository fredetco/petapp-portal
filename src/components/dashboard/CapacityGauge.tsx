interface Props {
  current: number;
  capacity: number | null;
}

export function CapacityGauge({ current, capacity }: Props) {
  if (!capacity) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-neutral-800 mb-3">Capacity</h3>
        <p className="text-sm text-neutral-500">
          No intake capacity set.{' '}
          <a href="/settings" className="text-portal-primary-500 hover:underline">Configure in settings</a>
        </p>
      </div>
    );
  }

  const pct = Math.min(Math.round((current / capacity) * 100), 100);
  const barColor =
    pct >= 90 ? 'bg-red-500' :
    pct >= 70 ? 'bg-amber-500' :
    'bg-portal-primary-500';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-neutral-800">Capacity</h3>
        <span className="text-sm font-semibold text-neutral-600">
          {current} / {capacity}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-neutral-100 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-neutral-500 mt-2">
        {pct}% occupied — {capacity - current} spots available
      </p>
    </div>
  );
}
