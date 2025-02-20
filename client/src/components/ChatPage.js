import React, { useState, useEffect } from 'react';

function ChatPage() {
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
        console.log(data);
        setResponse(data.response); // Assuming the response has a 'response' field
      })
      .catch(error => console.error('Error:', error));
    } else {
      console.error('Location not available');
    }
  };

  return (
    <div>
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
        <div>
          {response.restaurants && (
            <div>
              <h3>Restaurants:</h3>
              {response.restaurants.map((restaurant, index) => (
                <div key={index}>
                  <p>Name: {restaurant.name}</p>
                  <p>Address: {restaurant.address}</p>
                  <p>Distance: {restaurant.distance}</p>
                  <p>Walking Time: {restaurant.walking_time}</p>
                  <p>Rating: {restaurant.rating}</p>
                  <p>Website: {restaurant.website}</p>
                  <p>Phone Number: {restaurant.phone_number}</p>
                  <p>Open Now: {restaurant.open_now}</p>
                  <p>Description: {restaurant.description}</p>
                  {restaurant.photos && restaurant.photos.map((photo, index) => (
                    <img key={index} src={photo} alt="Restaurant" />
                  ))}
                  {restaurant.reviews && (
                    <div>
                      <h4>Reviews:</h4>
                      {restaurant.reviews.map((review, index) => (
                        <div key={index}>
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
          {response.gemini_recommendation && (
            <div>
              <h3>Gemini Recommendation:</h3>
              <p>{response.gemini_recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatPage;
