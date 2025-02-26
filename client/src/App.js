import React, { useState } from "react";
import "./App.css";
import TripOptions from "./components/Trip/TripOptions";
import CityCarousel from "./components/City/CityCarousel";
import CityPlanDisplay from "./components/City/CityPlanDisplay";

function App() {
  const [cities, setCities] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);

  return (
    <div className="App">
      <h1>Trip Planner</h1>
      <TripOptions setCities={setCities} />
      <CityCarousel cities={cities} />
      <CityPlanDisplay
        tripPlans={tripPlans}
        setExpandedPlanIndex={setExpandedPlanIndex}
        expandedPlanIndex={expandedPlanIndex}
      />
    </div>
  );
}

export default App;
