import { useState } from "react";
import { useTripContext } from "../contexts/TripContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Calendar, DollarSign, MapPin, FolderOpen } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import StorageNotice from "../components/StorageNotice";

const SavedTrips = () => {
  const { trips, deleteTrip, setCurrentTrip } = useTripContext();
  const navigate = useNavigate();
  const [tripToDelete, setTripToDelete] = useState(null);

  const handleViewTrip = (trip) => {
    setCurrentTrip(trip);
    navigate("/itinerary");
  };

  const handleDeleteTrip = (tripId) => {
    setTripToDelete(tripId);
  };

  const confirmDeleteTrip = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete);
      setTripToDelete(null);
    }
  };

  if (trips.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <StorageNotice />
          <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
            Saved Trips
          </h1>
          <div className="text-center py-16">
            <FolderOpen
              size={44}
              className="mx-auto mb-4 text-[var(--text-secondary)]"
            />
            <p className="mb-4 text-xl text-[var(--text-secondary)]">
              No saved trips yet
            </p>
            <button
              onClick={() => navigate("/")}
              className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-white"
            >
              Plan Your First Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <ConfirmDialog
        open={!!tripToDelete}
        title="Delete saved trip"
        message="This trip will be removed from your saved list."
        confirmLabel="Delete"
        onConfirm={confirmDeleteTrip}
        onCancel={() => setTripToDelete(null)}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StorageNotice />
        <h1 className="mb-8 text-3xl font-semibold text-[var(--text-primary)]">
          Saved Trips ({trips.length})
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition"
            >
              <div className="border-b border-[var(--border-soft)] p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-2 text-2xl font-semibold text-[var(--text-primary)]">
                      {trip.destination}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Calendar size={16} />
                      <span>
                        {trip.start_date} - {trip.end_date}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-[var(--text-secondary)] transition hover:text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <DollarSign size={18} />
                    <span>${trip.budget} per day</span>
                  </div>
                  {trip.itinerary_days && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <MapPin size={18} />
                      <span>{trip.itinerary_days.length} days planned</span>
                    </div>
                  )}
                </div>

                {trip.interests && trip.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.interests.slice(0, 3).map((interest, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-[var(--surface-alt)] px-2 py-1 text-xs text-[var(--text-secondary)]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleViewTrip(trip)}
                  className="w-full rounded-2xl bg-[var(--accent)] py-2 font-medium text-white"
                >
                  View Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedTrips;
