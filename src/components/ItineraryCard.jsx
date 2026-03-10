import { Calendar, Clock, MapPin, Hotel, Activity, Wallet, UtensilsCrossed } from "lucide-react";

const ItineraryCard = ({ day, dayNumber, activities = [], hotel = null }) => {
  const buildGoogleMapsUrl = (query) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="mb-6 overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="border-b border-[var(--border-soft)] bg-[var(--surface)] px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--text-primary)] text-lg font-bold text-[var(--surface-strong)]">
              {dayNumber}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Day {dayNumber}</h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Calendar size={15} />
                <span>{day.date}</span>
              </div>
            </div>
          </div>

          <div className="self-start rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] sm:self-auto">
            {activities.length} activities
          </div>
        </div>
        {day.food_cost_estimate ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--surface-alt)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <UtensilsCrossed size={14} />
            <span>Food estimate: ${day.food_cost_estimate}</span>
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-6">
        {activities.length > 0 && (
          <div className="mb-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={18} className="text-emerald-500" />
              <h4 className="font-semibold text-[var(--text-primary)]">Activities</h4>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex w-fit flex-shrink-0 items-center gap-2 rounded-xl bg-[var(--surface-strong)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] shadow-sm">
                      <Clock size={15} />
                      <span>{activity.time}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-lg font-semibold text-[var(--text-primary)]">
                          {activity.name}
                        </p>
                        {activity.estimated_cost ? (
                          <div className="flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <Wallet size={13} />
                            <span>${activity.estimated_cost}</span>
                          </div>
                        ) : null}
                      </div>

                      {activity.location && (
                        <a
                          href={buildGoogleMapsUrl(activity.location)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                        >
                          <MapPin size={14} />
                          <span className="truncate">{activity.location}</span>
                        </a>
                      )}

                      {activity.description && (
                        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hotel && (
          <div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-center gap-2">
              <Hotel size={18} className="text-[var(--accent)]" />
              <h4 className="font-semibold text-[var(--text-primary)]">Accommodation</h4>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-[var(--text-primary)]">{hotel.name}</p>
              {hotel.address && (
                <a
                  href={buildGoogleMapsUrl(hotel.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                >
                  <MapPin size={14} />
                  <span className="break-words">{hotel.address}</span>
                </a>
              )}
              {hotel.price && (
                <p className="text-sm font-semibold text-blue-700">
                  ${hotel.price} / night
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryCard;
