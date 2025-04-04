import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { RestaurantContext } from '../context/RestaurantContext';

export default function RestaurantDetails() {
  const { placeId } = useParams();
  const { restaurant } = useContext(RestaurantContext);

  if (!restaurant) {
    return <div>No restaurant details found.</div>;
  }

  const displayBool = (value) => {
    if (value === null || value === undefined) return "N/A";
    return value ? "Yes" : "No";
  };

  return (
    <div>
      <h1>{restaurant.name}</h1>
      <p><strong>Address:</strong> {restaurant.formatted_address}</p>
      <p><strong>Description:</strong> {restaurant.description}</p>
      <p><strong>Cuisine:</strong>{(restaurant.cuisine !== null && restaurant.cuisine !== undefined) ? restaurant.cuisine : "N/A"}</p>
      {restaurant.opening_hours && (
        <p>
          <strong>Open Now:</strong> {displayBool(restaurant.opening_hours.open_now)}
        </p>
      )}
      <p><strong>Rating:</strong> {restaurant.rating}</p>
      <p>
        <strong>Price Level:</strong>{" "}
        {(restaurant.price_level !== null && restaurant.price_level !== undefined) ? restaurant.price_level : "N/A"}
      </p>
      <p><strong>User Ratings Total:</strong> {restaurant.user_ratings_total}</p>
      <p>
        <strong>Reservations:</strong> {displayBool(restaurant.reservable)}
      </p>
      <p>
        <strong>Seating:</strong> {(restaurant.seating !== null && restaurant.seating !== undefined) ? restaurant.seating : "Uncertain"}
      </p>
      <p>
        <strong>Reservation Required:</strong> {(restaurant.reservation_required !== null &&
          restaurant.reservation_required !== undefined) ? restaurant.reservation_required : "Uncertain"}
      </p>
      <p>
        <strong>Walking Distance:</strong> {restaurant.walking_distance} ({restaurant.walking_duration})
      </p>
    </div>
  );
}
