import TripForm from "../components/TripForm";
import StorageNotice from "../components/StorageNotice";
import { Compass, MapPinned, PlaneTakeoff, Sparkles } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen overflow-x-hidden px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <StorageNotice />
        <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="min-w-0 pt-2 sm:pt-4 lg:pt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)] shadow-sm backdrop-blur">
              <Sparkles size={14} />
              Travel planning, made clear
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:mt-6 sm:text-5xl md:text-6xl">
              Plan a full trip without the usual clutter.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:mt-5 sm:text-lg sm:leading-8">
              Pick a place, choose your style, and get a day-by-day plan with a
              usable map and a cleaner PDF.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <PlaneTakeoff className="text-[var(--accent)]" size={24} />
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                  Fast trip plan
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Day-by-day activities, hotels, and budgets generated from one
                  destination search.
                </p>
              </div>

              <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <MapPinned className="text-[var(--accent)]" size={24} />
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                  Route view
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Key stops mapped quickly, with direct links to open each place
                  in Google Maps.
                </p>
              </div>

              <div className="rounded-[28px] border border-[var(--border-soft)] bg-[var(--surface-strong)] p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                <Compass className="text-[var(--accent)]" size={24} />
                <h3 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
                  Cleaner export
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Lightweight PDF output that stays readable instead of saving a
                  giant screenshot.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-w-0 overflow-hidden rounded-[32px] sm:rounded-[36px]">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-sky-200/40 blur-3xl sm:h-36 sm:w-36" />
            <div className="absolute -bottom-8 left-0 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl sm:h-40 sm:w-40" />
            <div className="relative rounded-[32px] border border-[var(--border-soft)] bg-[var(--surface)] p-2 sm:rounded-[36px] sm:p-4 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur">
              <TripForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
