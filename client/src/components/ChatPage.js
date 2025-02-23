import React, { useState, useEffect } from 'react';

export default function ChatPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

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
          },
          {
            enableHighAccuracy: true,
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
      .then(data => {
        console.log("Response fro api")
        console.log(data.restaurants);
        setResponse(data); // Assuming the response has a 'response' field
      })
      .catch(error => console.error('Error:', error));
    } else {
      console.error('Location not available');
    }
  };

  return (
    <div className="chat-container">
      <h1>Chat Page</h1>
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

      {response && (
        <div className="restaurant-container">
          <h2>Restaurants:</h2>
          {response.map((place, index) => (
            <div key={index} className="restaurant-container">
              <h3>{place.name}</h3>
              <p>Address: {place.formatted_address}</p>
              <p>Description: {place.description}</p>
              {place.opening_hours && <p>Open Now: {place.opening_hours.open_now ? 'Yes' : 'No'}</p>}
              <p>Rating: {place.rating}</p>
              <p>Walking Distance: {place.walking_distance} ({place.walking_duration})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
