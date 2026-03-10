import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import { TripProvider } from "./contexts/TripContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return null;
};

function App() {
  return (
    <ThemeProvider>
      <TripProvider>
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors">
          <ScrollToTop />
          <Navbar />
          <Outlet />
        </div>
      </TripProvider>
    </ThemeProvider>
  );
}

export default App;
