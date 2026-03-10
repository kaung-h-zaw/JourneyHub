import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import ItineraryView from "../pages/ItineraryView";
import SavedTrips from "../pages/SavedTrips";
import NotFound from "../pages/NotFound";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "itinerary", element: <ItineraryView /> },
      { path: "saved-trips", element: <SavedTrips /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
