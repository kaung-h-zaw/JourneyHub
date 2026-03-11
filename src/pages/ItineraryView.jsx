import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTripContext } from "../contexts/TripContext";
import { useTripGenerator } from "../hooks/useTripGenerator";
import { useGeocodingItinerary } from "../hooks/useGeocoding";
import ItineraryCard from "../components/ItineraryCard";
import MapView from "../components/MapView";
import PDFExportButton from "../components/PDFExportButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ToastMessage from "../components/ToastMessage";
import {
  ArrowLeft,
  Save,
  RefreshCw,
  AlertCircle,
  CalendarRange,
  MapPinned,
  Wallet,
  Sparkles,
} from "lucide-react";

const ItineraryView = () => {
  const navigate = useNavigate();
  const { currentTrip, saveTrip, updateItinerary, clearCurrentTrip } =
    useTripContext();
  const { loading, error, itinerary, generate } = useTripGenerator();
  const itineraryRef = useRef();
  const isNavigatingAway = useRef(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const displayedItinerary =
    itinerary ??
    (currentTrip?.itinerary_days?.length
      ? {
          days: currentTrip.itinerary_days,
          total_estimated_cost: currentTrip.total_estimated_cost,
        }
      : null);

  const {
    places: mapPlaces,
    loading: geocoding,
    error: geocodingError,
  } = useGeocodingItinerary(displayedItinerary?.days, currentTrip?.destination);

  const generateNewItinerary = useCallback(async () => {
    try {
      await generate(currentTrip);
    } catch (err) {
      console.error("Failed to build trip plan:", err);
    }
  }, [currentTrip, generate]);

  useEffect(() => {
    if (currentTrip && currentTrip.itinerary_days?.length === 0) {
      generateNewItinerary();
    }
  }, [currentTrip, generateNewItinerary]);

  useEffect(() => {
    if (itinerary?.days) {
      updateItinerary(itinerary.days, itinerary.total_estimated_cost ?? null);
    }
  }, [itinerary, updateItinerary]);

  const handleSaveTrip = () => {
    if (displayedItinerary) {
      saveTrip({
        ...currentTrip,
        itinerary_days: displayedItinerary.days,
        total_estimated_cost: displayedItinerary.total_estimated_cost ?? null,
      });
      setShowSaveToast(true);
    }
  };

  useEffect(() => {
    if (!showSaveToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setShowSaveToast(false);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveToast]);

  const leavePlanPage = (path = "/") => {
    clearCurrentTrip();
    window.location.href = path;
  };

  if (!currentTrip && !isNavigatingAway.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-xl text-[var(--text-secondary)]">
            No trip data found
          </p>
          <button
            onClick={() => leavePlanPage("/")}
            className="rounded-2xl bg-[var(--accent)] px-6 py-3 text-white"
          >
            Create New Trip
          </button>
        </div>
      </div>
    );
  }

  const totalActivities =
    displayedItinerary?.days?.reduce(
      (sum, day) => sum + (day.activities?.length || 0),
      0,
    ) || 0;

  return (
    <div className="min-h-screen overflow-x-hidden py-4 sm:py-8">
      <ToastMessage open={showSaveToast} message="Trip saved successfully." />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:mb-8 sm:rounded-[32px]">
          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <button
              onClick={() => leavePlanPage("/")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>

            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-primary)]">
                  <Sparkles size={14} />
                  Smart Trip Plan
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                  {currentTrip.destination}
                </h1>
                <p className="mt-3 text-base text-[var(--text-secondary)] sm:text-lg">
                  A clear day-by-day plan with a map you can actually use.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {currentTrip.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-[var(--border-soft)] bg-[var(--surface-alt)] px-3 py-1 text-sm font-medium text-[var(--text-secondary)]"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {!loading && displayedItinerary && (
                <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:grid-cols-none xl:auto-cols-max xl:grid-flow-col xl:justify-end">
                  <button
                    onClick={generateNewItinerary}
                    disabled={geocoding}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--surface-strong)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={18}
                      className={geocoding ? "animate-spin" : ""}
                    />
                    <span>Refresh Plan</span>
                  </button>
                  <button
                    onClick={handleSaveTrip}
                    disabled={geocoding}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>Save Trip</span>
                  </button>
                  <PDFExportButton
                    trip={currentTrip}
                    itineraryRef={itineraryRef}
                  />
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                    <CalendarRange size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Travel Dates
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {currentTrip.start_date} to {currentTrip.end_date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Trip Style
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {currentTrip.trip_style
                        ? currentTrip.trip_style.charAt(0).toUpperCase() +
                          currentTrip.trip_style.slice(1)
                        : `$${currentTrip.budget} per day`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
                    <MapPinned size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                      Mapped Stops
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                      {mapPlaces.length} places
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner size="lg" text="AI is planning your trip..." />
            <p className="mt-4 max-w-md text-center text-[var(--text-secondary)]">
              This may take 10-20 seconds. We're analyzing the best activities,
              hotels, and routes for your {currentTrip.destination} adventure.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200/80 bg-red-50/90 p-6 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="flex-shrink-0 text-red-600" size={24} />
              <div className="flex-1">
                <h3 className="mb-2 font-bold text-red-800">
                  Failed to Build Plan
                </h3>
                <p className="mb-4 text-red-700">{error}</p>
                <button
                  onClick={generateNewItinerary}
                  className="rounded-2xl bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {geocoding && !loading && (
          <div className="mb-6 rounded-3xl border border-blue-200/80 bg-blue-50/90 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="flex items-center gap-3">
              <RefreshCw className="animate-spin text-blue-600" size={20} />
              <p className="text-sm text-blue-800">
                Mapping activity locations. Cached places load much faster on
                the next visit.
              </p>
            </div>
          </div>
        )}

        {geocodingError && !geocoding && (
          <div className="mb-6 rounded-3xl border border-yellow-200/80 bg-yellow-50/90 p-4 dark:border-yellow-500/20 dark:bg-yellow-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="flex-shrink-0 text-yellow-600"
                size={20}
              />
              <p className="text-sm text-yellow-800">
                Some locations could not be mapped exactly, so approximate
                coordinates are being used for a few stops.
              </p>
            </div>
          </div>
        )}

        {!loading && displayedItinerary && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px] xl:gap-8">
            <div ref={itineraryRef} className="min-w-0">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                    Daily Plan
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                    Your trip plan
                  </h2>
                </div>

                {displayedItinerary.total_estimated_cost ? (
                  <div className="rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] px-5 py-4 text-left shadow-sm sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      Total Estimated Cost
                    </p>
                    <p className="mt-1 text-3xl font-bold text-[var(--accent)]">
                      ${displayedItinerary.total_estimated_cost}
                    </p>
                  </div>
                ) : null}
              </div>

              {displayedItinerary.days.map((day, index) => (
                <ItineraryCard
                  key={index}
                  day={day}
                  dayNumber={index + 1}
                  activities={day.activities}
                  hotel={day.hotel}
                />
              ))}
            </div>

            <div className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
              <MapView
                places={mapPlaces}
                loading={geocoding}
                destination={currentTrip.destination}
              />

              <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Trip Summary
                </p>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
                    <span className="text-[var(--text-secondary)]">
                      Duration
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {displayedItinerary.days.length} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
                    <span className="text-[var(--text-secondary)]">
                      Activities
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {totalActivities} total
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
                    <span className="text-[var(--text-secondary)]">Budget</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      ${currentTrip.budget}/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[var(--surface)] px-4 py-3">
                    <span className="text-[var(--text-secondary)]">
                      Mapped Stops
                    </span>
                    <span className="font-semibold text-[var(--accent)]">
                      {mapPlaces.length} places
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryView;
