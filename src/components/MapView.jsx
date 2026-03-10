import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Loader2, MapPin, Expand, Shrink, X } from "lucide-react";

const DEFAULT_CENTER = [35.6895, 139.6917];
const LIGHT_TILE_URL = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const createMarkerIcon = (index, isSelected) =>
  L.divIcon({
    className: "",
    html: `<div class="map-stop-pin ${isSelected ? "map-stop-pin-active" : ""}"><span>${index + 1}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });

const MapBoundsController = ({ places, fallbackCenter, focusedPlace, expanded }) => {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, [expanded, map]);

  useEffect(() => {
    if (focusedPlace) {
      map.setView([focusedPlace.lat, focusedPlace.lng], Math.max(map.getZoom(), 15), {
        animate: true,
      });
      return;
    }

    if (places.length === 0) {
      map.setView(fallbackCenter, 12);
      return;
    }

    if (places.length === 1) {
      map.setView([places[0].lat, places[0].lng], 14);
      return;
    }

    const bounds = L.latLngBounds(places.map((place) => [place.lat, place.lng]));
    map.fitBounds(bounds, { padding: [48, 48] });
  }, [expanded, fallbackCenter, focusedPlace, map, places]);

  return null;
};

const MapView = ({ places = [], center = null, loading = false, destination = "" }) => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const fallbackCenter = useMemo(
    () =>
      center ||
      (places.length > 0
        ? [places[0].lat, places[0].lng]
        : DEFAULT_CENTER),
    [center, places],
  );
  const selectedPlace =
    places.find(
      (place, index) =>
        `${place.name}-${place.lat}-${place.lng}-${index}` === selectedKey,
    ) || null;

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [expanded]);

  return (
    <>
      {expanded ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm" />
      ) : null}

      <div
        className={`overflow-hidden border border-[var(--border-soft)] bg-[var(--surface-strong)] shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${
          expanded
            ? "fixed inset-0 z-40 flex flex-col rounded-none"
            : "rounded-[28px]"
        }`}
      >
        <div className="border-b border-[var(--border-soft)] bg-[var(--surface)] px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
            Route Map
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                A quick look at the places in your plan.
              </p>
              {destination ? (
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {destination}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="rounded-full bg-[var(--surface-alt)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                {places.length} places
              </span>
              {expanded ? (
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                >
                  <X size={14} />
                  <span>Close</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--surface-alt)]"
                >
                  <Expand size={14} />
                  <span>Expand</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className={`relative ${
            expanded
              ? "min-h-0 flex-1"
              : "h-[320px] sm:h-[360px] lg:h-[420px]"
          }`}
        >
          <MapContainer
            center={fallbackCenter}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
              url={LIGHT_TILE_URL}
              subdomains="abcd"
            />

            <MapBoundsController
              places={places}
              fallbackCenter={fallbackCenter}
              focusedPlace={selectedPlace}
              expanded={expanded}
            />

            {places.map((place, index) => {
              const markerKey = `${place.name}-${place.lat}-${place.lng}-${index}`;

              return (
                <Marker
                  key={markerKey}
                  position={[place.lat, place.lng]}
                  icon={createMarkerIcon(index, selectedKey === markerKey)}
                  eventHandlers={{
                    click: () => setSelectedKey(markerKey),
                    popupclose: () => setSelectedKey(null),
                  }}
                >
                  <Popup>
                    <div className="min-w-[220px] max-w-[280px] p-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                        Stop {index + 1}
                      </p>
                      <h4 className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                        {place.name}
                      </h4>
                      {place.location && (
                        <p className="mt-2 text-sm text-[var(--text-secondary)]">
                          {place.location}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-[color:var(--surface)]/90 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 animate-spin text-[var(--accent)]" size={30} />
              <p className="text-sm text-[var(--text-secondary)]">Finding the trip stops on the map...</p>
            </div>
          </div>
        )}

        {!loading && places.length === 0 && (
          <div className="absolute inset-0 z-[450] flex items-center justify-center bg-[color:var(--surface)]/95">
            <div className="text-center text-[var(--text-secondary)]">
              <MapPin size={42} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No locations to display yet</p>
            </div>
          </div>
        )}
        </div>

        {places.length > 0 && (
          <div className="border-t border-[var(--border-soft)] bg-[var(--surface)] px-4 py-3">
            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {places.slice(0, 8).map((place, index) => (
                <button
                  key={`${place.name}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedKey(`${place.name}-${place.lat}-${place.lng}-${index}`)
                  }
                  className="flex min-w-[190px] flex-none items-center gap-3 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-strong)] px-3 py-2 text-left shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--surface-alt)] sm:min-w-[220px]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--text-primary)] text-xs font-semibold text-[var(--surface-strong)]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
                      {place.name}
                    </span>
                    <span className="block truncate text-xs text-[var(--text-secondary)]">
                      {place.location}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MapView;
