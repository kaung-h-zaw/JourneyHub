import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Heart,
  AlertCircle,
  Plane,
  Search,
  X,
  Briefcase,
} from "lucide-react";
import { useTripContext } from "../contexts/TripContext";
import { searchDestinationSuggestions } from "../api/geocoding";

const TripForm = () => {
  const tripStyleOptions = [
    {
      id: "budget",
      label: "Budget",
      description: "Smart savings",
      budget: 80,
    },
    {
      id: "normal",
      label: "Standard",
      description: "Balanced comfort",
      budget: 160,
    },
    {
      id: "family",
      label: "Family",
      description: "Kid-friendly mix",
      budget: 180,
    },
    {
      id: "romantic",
      label: "Romantic",
      description: "Couple getaway",
      budget: 220,
    },
    {
      id: "adventure_plus",
      label: "Adventure",
      description: "Action-focused",
      budget: 200,
    },
    {
      id: "luxury",
      label: "Luxury",
      description: "Premium stays",
      budget: 320,
    },
  ];

  const navigate = useNavigate();
  const { createTrip } = useTripContext();
  const [errors, setErrors] = useState({});
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const destinationSearchRef = useRef(null);
  const destinationContainerRef = useRef(null);
  const skipNextDestinationSearchRef = useRef(false);

  const [formData, setFormData] = useState({
    destination: "",
    start_date: "",
    num_days: "4",
    budget: 160,
    trip_style: "normal",
    interests: [],
  });

  const interestOptions = [
    "Adventure",
    "Culture",
    "Food",
    "Nature",
    "Shopping",
    "Nightlife",
    "Relaxation",
    "Photography",
    "History",
    "Art",
  ];

  useEffect(() => {
    const query = formData.destination.trim();

    if (skipNextDestinationSearchRef.current) {
      skipNextDestinationSearchRef.current = false;
      return;
    }

    if (query.length < 2) {
      return;
    }

    destinationSearchRef.current = window.setTimeout(async () => {
      setIsSearchingDestinations(true);
      const suggestions = await searchDestinationSuggestions(query);
      setDestinationSuggestions(suggestions);
      setShowSuggestions(true);
      setIsSearchingDestinations(false);
    }, 300);

    return () => {
      window.clearTimeout(destinationSearchRef.current);
    };
  }, [formData.destination]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        destinationContainerRef.current &&
        !destinationContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.num_days.trim()) {
      newErrors.num_days = "Number of days is required";
    }

    const start = new Date(formData.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      newErrors.start_date = "Start date cannot be in the past";
    }

    if (!/^\d+$/.test(formData.num_days.trim())) {
      newErrors.num_days = "Use digits only";
    } else if (
      Number(formData.num_days) < 1 ||
      Number(formData.num_days) > 30
    ) {
      newErrors.num_days = "Trip duration must be between 1 and 30 days";
    }

    if (formData.interests.length === 0) {
      newErrors.interests = "Please select at least one interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedTripStyle =
      tripStyleOptions.find((option) => option.id === formData.trip_style) ||
      tripStyleOptions[1];
    const tripLength = Number(formData.num_days);
    const endDate = new Date(formData.start_date);
    endDate.setDate(endDate.getDate() + tripLength - 1);

    createTrip({
      ...formData,
      end_date: endDate.toISOString().split("T")[0],
      num_days: tripLength,
      budget: selectedTripStyle.budget,
      trip_style: selectedTripStyle.id,
    });
    navigate("/itinerary");
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
    if (errors.interests) {
      setErrors({ ...errors, interests: null });
    }
  };

  const handleDestinationSelect = (suggestion) => {
    skipNextDestinationSearchRef.current = true;
    setFormData((prev) => ({
      ...prev,
      destination: suggestion.label,
    }));
    setDestinationSuggestions([]);
    setShowSuggestions(false);
    if (errors.destination) {
      setErrors({ ...errors, destination: null });
    }
  };

  const clearDestination = () => {
    setFormData((prev) => ({ ...prev, destination: "" }));
    setDestinationSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl min-w-0 rounded-[28px] bg-transparent p-3 sm:p-6"
    >
      <h2 className="mb-6 text-center text-[2rem] font-semibold leading-tight text-[var(--text-primary)] sm:text-3xl">
        Plan Your Next Trip
      </h2>

      <div className="mb-6" ref={destinationContainerRef}>
        <label className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <MapPin size={20} className="text-[var(--accent)]" />
          Destination
        </label>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="text"
            required
            value={formData.destination}
            onFocus={() => {
              if (destinationSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onChange={(e) => {
              const nextDestination = e.target.value;
              const nextQuery = nextDestination.trim();

              setFormData({ ...formData, destination: nextDestination });

              if (nextQuery.length < 2) {
                setDestinationSuggestions([]);
                setShowSuggestions(false);
                setIsSearchingDestinations(false);
              } else {
                setShowSuggestions(true);
              }

              if (errors.destination) {
                setErrors({ ...errors, destination: null });
              }
            }}
            placeholder="Search city or country"
            className={`block w-full max-w-full min-w-0 rounded-2xl border bg-[var(--surface-strong)] py-4 pl-12 pr-24 text-base text-[var(--text-primary)] shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              errors.destination
                ? "border-red-500"
                : "border-[var(--border-soft)]"
            }`}
          />
          {formData.destination && !isSearchingDestinations && (
            <button
              type="button"
              onClick={clearDestination}
              className="absolute right-11 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          )}
          {isSearchingDestinations && (
            <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]/80 [animation-delay:150ms]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]/60 [animation-delay:300ms]" />
            </div>
          )}

          {showSuggestions && (
            <div className="absolute z-20 mt-3 w-full overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-2xl">
              <div className="border-b border-[var(--border-soft)] px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  Suggested destinations
                </p>
              </div>
              {destinationSuggestions.length > 0 ? (
                destinationSuggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.label}-${suggestion.type}`}
                    type="button"
                    onClick={() => handleDestinationSelect(suggestion)}
                    className="flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-[var(--surface-alt)]"
                  >
                    <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--surface-alt)] text-[var(--text-secondary)]">
                      <Plane size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-[var(--text-primary)]">
                        {suggestion.city}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {[suggestion.region, suggestion.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium capitalize text-[var(--accent)]">
                      {suggestion.type}
                    </span>
                  </button>
                ))
              ) : !isSearchingDestinations ? (
                <div className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                  No city or country matches found.
                </div>
              ) : null}
            </div>
          )}
        </div>
        {errors.destination && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.destination}
          </p>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Calendar size={20} className="text-[var(--accent)]" />
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => {
                setFormData({ ...formData, start_date: e.target.value });
                if (errors.start_date) {
                  setErrors({ ...errors, start_date: null });
                }
              }}
              min={new Date().toISOString().split("T")[0]}
              className={`block w-full max-w-full min-w-0 appearance-none rounded-2xl border bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
                errors.start_date
                  ? "border-red-500"
                  : "border-[var(--border-soft)]"
              } ${formData.start_date ? "" : "text-transparent"}`}
            />
            {!formData.start_date ? (
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base text-[var(--text-secondary)]">
                Choose a start date
              </span>
            ) : null}
          </div>
          {errors.start_date && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.start_date}
            </p>
          )}
        </div>
        <div className="min-w-0">
          <label className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            <Calendar size={20} className="text-[var(--accent)]" />
            Number of Days
          </label>
          <input
            type="text"
            required
            inputMode="numeric"
            pattern="[0-9]*"
            value={formData.num_days}
            onChange={(e) => {
              setFormData({
                ...formData,
                num_days: e.target.value.replace(/[^\d]/g, ""),
              });
              if (errors.num_days) {
                setErrors({ ...errors, num_days: null });
              }
            }}
            className={`block w-full max-w-full min-w-0 rounded-2xl border bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${
              errors.num_days ? "border-red-500" : "border-[var(--border-soft)]"
            }`}
          />
          {errors.num_days && (
            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.num_days}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <Briefcase size={20} className="text-[var(--accent)]" />
          Trip Style
        </label>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {tripStyleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  trip_style: option.id,
                  budget: option.budget,
                }))
              }
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                formData.trip_style === option.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm"
                  : "border-[var(--border-soft)] bg-[var(--surface-strong)] hover:border-[var(--text-secondary)]"
              }`}
            >
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {option.label}
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {option.description}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                Approx. ${option.budget}/day
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="mb-3 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <Heart size={20} className="text-[var(--accent)]" />
          Interests (Select at least 1)
        </label>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                formData.interests.includes(interest)
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "bg-[var(--surface-alt)] text-[var(--text-secondary)] hover:bg-[var(--border-soft)]"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        {errors.interests && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.interests}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-lg font-semibold text-white transition hover:opacity-95"
      >
        Build My Plan
      </button>
    </form>
  );
};

export default TripForm;
