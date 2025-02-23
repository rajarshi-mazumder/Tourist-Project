import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import './global.css';
import TripForm from "./components/TripForm";
import TripDisplay from "./components/TripDisplay";
import ChatPage from "./components/ChatPage";

function App() {
  const [tripData, setTripData] = useState(null);

  return (
    <Router>
      <div className="App">
        <h1></h1>
        <Routes>
          <Route path="/" element={<><TripForm setTripData={setTripData} /><TripDisplay tripData={tripData} /></>} />
          <Route path="/food" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
