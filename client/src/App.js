import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import "./global.css";
import TripDisplay from "./components/TripDisplay";
import ChatPage from "./components/ChatPage";
import CityCarousel from "./components/CityCarousel";
import TripOptions from "./components/TripOptions";
import { CityImageProvider } from "./context/CityImageContext";

function App() {
  const [tripData, setTripData] = useState(null);
  const [cities, setCities] = useState(null);
  const city = cities ? cities[0]?.name : null;

  return (
    <CityImageProvider>
      <Router>
        <div className="App">
          <h1></h1>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <TripOptions setCities={setCities} />
                  {cities && <CityCarousel cities={cities} />}
                  <TripDisplay tripData={tripData} city={city} />
                </>
              }
            />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </div>
      </Router>
    </CityImageProvider>
  );
}

export default App;
