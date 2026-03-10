import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { TripProvider } from "./contexts/TripContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <TripProvider>
        <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors">
          <Navbar />
          <Outlet />
        </div>
      </TripProvider>
    </ThemeProvider>
  );
}

export default App;
