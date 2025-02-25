import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function RestaurantDetails() {
  const { placeId } = useParams();
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch("http://localhost/food/details?place_id=" + placeId);
        if (!response.ok) {
          throw new Error("HTTP error! status: " + response.status);
        }
        const data = await response.json();
        setRestaurantDetails(data);
      } catch (e) {
        setError(e.message);
      }
    };

    fetchRestaurantDetails();
  }, [placeId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!restaurantDetails) {
    return <div>Loading restaurant details...</div>;
  }

  return (
    <div>
      <h1>{restaurantDetails.name}</h1>
      <p>Rating: {restaurantDetails.rating}</p>
      <p>Address: {restaurantDetails.formatted_address}</p>
      <p>Phone: {restaurantDetails.formatted_phone_number}</p>
      <p>Website: {restaurantDetails.website}</p>
      {/* Display other details as needed */}
    </div>
  );
}
