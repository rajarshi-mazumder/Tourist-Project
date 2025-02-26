import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './global.css';
import TripForm from "./components/TripForm";
import TripDisplay from "./components/TripDisplay";
import ChatPage from "./components/ChatPage";
import RestaurantDetails from "./components/RestaurantDetails";
import { RestaurantProvider } from './context/RestaurantContext';

function App() {
  const [tripData, setTripData] = useState(null);

  return (
    <RestaurantProvider>
      <Router>
        <div className="App">
          <h1></h1>
          <Routes>
            <Route path="/" element={<><TripForm setTripData={setTripData} /><TripDisplay tripData={tripData} /></>} />
            <Route path="/food" element={<ChatPage />} />
            <Route path="/restaurant/:placeId" element={<RestaurantDetails />} />
          </Routes>
        </div>
      </Router>
    </RestaurantProvider>
  );
}

export default App;
