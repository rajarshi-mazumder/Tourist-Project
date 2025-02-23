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

      {response && response.restaurants && (
        <div className="restaurant-container">
          <h2>Restaurants:</h2>
          {response.restaurants.map((restaurant, index) => (
            <div key={index} className="restaurant-container">
              <h3>{restaurant.name}</h3>
              {restaurant.rating && <p>Rating: {restaurant.rating}</p>}
              {/* <p>Address: {restaurant.address}</p>
              <p>distance: {restaurant.distance}</p>
              <p>walkingTime: {restaurant.walkingTime}</p> */}
              <p>Description: {restaurant.description}</p>
              {restaurant.website && <p>Website: <a href={restaurant.website}>{restaurant.website}</a></p>}
              {restaurant.phone && <p>Phone: {restaurant.phone}</p>}
              {restaurant.openNow !== undefined && <p>Open Now: {restaurant.openNow ? 'Yes' : 'No'}</p>}
              {restaurant.photos && (
                <div>
                  Photos:
                  {restaurant.photos.map((photo, photoIndex) => (
                    <img key={photoIndex} src={photo} alt="Restaurant" />
                  ))}
                </div>
              )}
              {restaurant.reviews && (
                <div>
                  Reviews:
                  {restaurant.reviews.map((review, reviewIndex) => (
                    <div key={reviewIndex}>
                      <p>Author: {review.author_name}</p>
                      <p>Text: {review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
