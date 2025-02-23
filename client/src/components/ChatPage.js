import React, { useState, useEffect } from 'react';

export default function ChatPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null); // Initialize as null

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
              setError('Invalid location data received from browser.');
            } else {
              setLocation({ latitude, longitude });
            }
          },
          (err) => setError(err.message),
          { enableHighAccuracy: true }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };

    getLocation();
  }, []);

  const handleSend = () => {
    if (location) {
      fetch('http://localhost/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Response from API:", data);
          setResponse(data); // Assuming data is an array of restaurant objects
        })
        .catch((err) => console.error('Error:', err));
    } else {
      console.error('Location not available');
    }
  };

  // Helper function to convert booleans or missing values to a display string.
  const displayBool = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  return (
    <div className="chat-container">
      <h1>Chat Page</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {location && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
      <button onClick={handleSend}>Send</button>

      {response && Array.isArray(response) && (
        <div className="restaurant-container">
          <h2>Restaurants:</h2>
          {response.map((place, index) => (
            <div key={index} className="restaurant-item" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{place.name}</h3>
              <p><strong>Address:</strong> {place.formatted_address}</p>
              <p><strong>Description:</strong> {place.description}</p>
              {place.opening_hours && (
                <p>
                  <strong>Open Now:</strong> {displayBool(place.opening_hours.open_now)}
                </p>
              )}
              <p><strong>Rating:</strong> {place.rating}</p>
              <p>
                <strong>Price Level:</strong>{" "}
                {(place.price_level !== null && place.price_level !== undefined) ? place.price_level : "N/A"}
              </p>
              <p><strong>User Ratings Total:</strong> {place.user_ratings_total}</p>
              <p>
                <strong>Curbside Pickup:</strong> {displayBool(place.curbside_pickup)}
              </p>
              <p>
                <strong>Delivery:</strong> {displayBool(place.delivery)}
              </p>
              <p>
                <strong>Dine-in:</strong> {displayBool(place.dine_in)}
              </p>
              <p>
                <strong>Takeout:</strong> {displayBool(place.takeout)}
              </p>
              <p>
                <strong>Reservations:</strong> {displayBool(place.reservable)}
              </p>
              <p>
                <strong>Payment Options:</strong>{" "}
                {place.payment_options ? place.payment_options : "N/A"}
              </p>
              <p>
                <strong>Accessibility Information:</strong>{" "}
                {displayBool(place.wheelchair_accessible)}
              </p>
              <p>
                <strong>Walking Distance:</strong> {place.walking_distance} ({place.walking_duration})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
