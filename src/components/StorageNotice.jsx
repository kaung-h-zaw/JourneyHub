import { Clock3 } from "lucide-react";
import { useTripContext } from "../contexts/TripContext";

const StorageNotice = () => {
  const { storagePolicy } = useTripContext();

  return (
    <div className="mb-6 rounded-[24px] border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">
      <div className="flex items-start gap-3">
        <Clock3
          size={18}
          className="mt-0.5 flex-shrink-0 text-[var(--accent)]"
        />
        <p>
          Trips saved on this device expire after{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {storagePolicy.tripsTtlDays} days
          </span>
          . Current trip drafts clear after{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {storagePolicy.currentTripTtlHours} hours
          </span>
          . Map cache also clears automatically to keep storage light on phones,
          tablets, and laptops.
        </p>
      </div>
    </div>
  );
};

export default StorageNotice;
