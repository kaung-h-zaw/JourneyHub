import { useNavigate } from "react-router-dom";
import { Plane, Save, Home, Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useTripContext } from "../contexts/TripContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { clearCurrentTrip } = useTripContext();
  const { theme, toggleTheme } = useTheme();

  const goToPage = (path) => {
    clearCurrentTrip();
    navigate(path);
    window.setTimeout(() => {
      if (window.location.pathname !== path) {
        window.location.assign(path);
      }
    }, 80);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-soft)] bg-[color:var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <button
          type="button"
          onClick={() => goToPage("/")}
          className="flex min-w-0 items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-alt)] text-[var(--accent)]">
            <Plane size={22} />
          </span>
          <span className="truncate text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
            JourneyHub
          </span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--surface-alt)] px-3 text-sm font-medium text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            <span className="hidden sm:inline">
              {theme === "light" ? "Dark" : "Light"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => goToPage("/")}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-[var(--text-secondary)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Home</span>
          </button>

          <button
            type="button"
            onClick={() => goToPage("/saved-trips")}
            className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-[var(--text-secondary)] transition hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]"
          >
            <Save size={18} />
            <span className="hidden sm:inline">Saved Trips</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
