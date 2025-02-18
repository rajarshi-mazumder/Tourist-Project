import React, { useState, useEffect } from 'react';
import './App.css';
import TripForm from "./components/TripForm";
import TripDisplay from "./components/TripDisplay";
function App() {
  const [tripData, setTripData] = useState(null);

  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
              setError('Invalid location data received from browser.');
            } else {
              setLocation({
                latitude: latitude,
                longitude: longitude,
              });
            }
          },
          (err) => {
            setError(err.message);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };

    getLocation();
  }, []);

  const handleSend = () => {
    // Send location and message to server
    if (location) {
      fetch('http://localhost/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message, // Use message from input
          location: location,
        }),
      })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
    } else {
      console.error('Location not available');
    }
  };

  return (
    <div className="App">
      <h1>Tourist App</h1>
      <TripForm setTripData={setTripData} />
      <TripDisplay tripData={tripData} />
      {error && <p>{error}</p>}
      {location && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default App;
