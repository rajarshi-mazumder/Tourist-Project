
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './global.css';
import TripForm from "./components/TripForm";
import TripDisplay from "./components/TripDisplay";
import FoodPage from "./components/FoodPage";
import RestaurantDetails from "./components/RestaurantDetails";
import ChatPage from "./components/ChatPage";
import { RestaurantProvider } from './context/RestaurantContext';
import TripOptions from "./components/Trip/TripOptions";
import CityCarousel from "./components/City/CityCarousel";
import CityPlanDisplay from "./components/City/CityPlanDisplay";

function App() {
  const [tripData, setTripData] = useState(null);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [tripPlans, setTripPlans] = useState([]);
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);

  return (
    <RestaurantProvider>
      <Router>
        <div className="App">
          <h1></h1>
          <Routes>
            <Route path="/" element={<><TripForm setTripData={setTripData} /><TripDisplay tripData={tripData} /></>} />
            <Route path="/food" element={<FoodPage setError={setError} />} />
            <Route path="/restaurant/:placeId" element={<RestaurantDetails />} />
            <Route path="/chat" element={<ChatPage setError={setError} />} />
          </Routes>
          <h1>Trip Planner</h1>
          <TripOptions setCities={setCities} />
          <CityCarousel cities={cities} />
          <CityPlanDisplay
            tripPlans={tripPlans}
            setExpandedPlanIndex={setExpandedPlanIndex}
            expandedPlanIndex={expandedPlanIndex}
          />
        </div>
      </Router>
    </RestaurantProvider>
  );
}

export default App;
