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
      {response && <p>Response: {response}</p>}
    </div>
  );
}

export default ChatPage;
