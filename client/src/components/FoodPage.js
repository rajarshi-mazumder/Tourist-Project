import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { RestaurantContext } from '../context/RestaurantContext';

export default function FoodPage() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setRestaurant, places, setPlaces } = useContext(RestaurantContext);

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

  const handleSend = (foodCategory) => {
    if (location) {
      fetch('http://localhost/food/new-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, foodCategory }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Response from API:", data);
          setPlaces(data);
        })
        .catch((err) => {
          console.error('Error:', err);
          setError(err.message);
        });
    } else {
      console.error('Location not available');
      setError('Location not available');
    }
  };

  const handleRestaurantClick = (place) => {
    setRestaurant(place);
    navigate(`/restaurant/${place.place_id}`);
  };

  const displayBool = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="chat-container">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {location && (
        <p>
          Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}
      <button onClick={() => handleSend('restaurants')}>Restaurants</button>
      <button onClick={() => handleSend('ハンバーガー')}>HamBurger</button>
      <button onClick={() => handleSend('Burger')}>Burger</button>
      <button onClick={() => handleSend('ピザ')}>Pizza</button>
      <button onClick={() => handleSend('izakaya')}>Izakaya</button>
      <button onClick={() => handleSend('italian_restaurant')}>Italian</button>
      <button onClick={() => handleSend('japanese')}>Japanese</button>

      <div className="restaurant-container">
        <h2>Restaurants:</h2>
        {places.map((place, index) => {
          console.log("Place Photos:", place.photos);
          return (
            <div
              key={index}
              className="restaurant-item"
              style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}
              onClick={() => handleRestaurantClick(place)}
            >
              <h3>{place.name}</h3>
              {place.thumbnail_img ? (
                <img src={place.thumbnail_img} alt={place.name} className="restaurant-image" style={{ width: '300px', height: '200px', objectFit: 'cover' }} />
              ) : (place.photos && place.photos.length > 0 && (
                <Slider {...sliderSettings}>
                  {place.photos.map((photo, photoIndex) => (
                    <div key={photoIndex}>
                      <img src={photo} alt={place.name} className="restaurant-image" style={{ width: '300px', height: '200px', objectFit: 'cover' }} />
                    </div>
                  ))}
                </Slider>
              ))}
              <p><strong>Address:</strong> {place.formatted_address}</p>
              <p><strong>Description:</strong> {place.description}</p>
              <p><strong>Cuisine:</strong>{(place.cuisine !== null && place.cuisine !== undefined) ? place.cuisine : "N/A"}</p>
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
                <strong>Reservations:</strong> {displayBool(place.reservable)}
              </p>
              <p>
                <strong>Seating:</strong> {(place.seating !== null && place.seating !== undefined) ? place.seating : "Uncertain"}
              </p>
              <p>
                <strong>Reservation Required:</strong> {(place.reservation_required !== null &&
                  place.reservation_required !== undefined) ? place.reservation_required : "Uncertain"}
              </p>
              <p>
                <strong>Walking Distance:</strong> {place.walking_distance} ({place.walking_duration})
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
