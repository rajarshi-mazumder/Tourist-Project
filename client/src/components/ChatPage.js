import React, { useState, useEffect } from 'react';

export default function ChatPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
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
    // Send location to server
    if (location) {
      fetch('http://localhost/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: location,
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log("Response fro api")
        console.log(data);
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
   
      <button onClick={handleSend}>Send</button>

      {response && (
        <div className="restaurant-container">
          <h2>Restaurants:</h2>
          {response.map((place, index) => (
            <div key={index} className="restaurant-container">
              <h3>{place.name}</h3>
              <p>Address: {place.formatted_address}</p>
              <p>Description: {place.description}</p>
              {place.opening_hours && <p>Open Now: {place.opening_hours.open_now}</p>}
              <p>Rating: {place.rating}</p>
              <p>Price Level: {place.price_level}</p>
              <p>User Ratings Total: {place.user_ratings_total}</p>
<p>Curbside Pickup: {place.curbside_pickup}</p>
<p>Delivery: {place.delivery}</p>
<p>Dine-in: {place.dine_in}</p>
<p>Takeout: {place.takeout}</p>
<p>Reservations: {place.reservations}</p>
              <p>Payment Options: {place.payment_options}</p>
<p>Accessibility Information: {place.wheelchair_accessible}</p>
              <p>Walking Distance: {place.walking_distance} ({place.walking_duration})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
