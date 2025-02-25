import React from "react";

function GoogleMapsHotelCard({ accommodation }) {
  return (
    <div className="carousel-card">
      <h3>{accommodation.name}</h3>
      {accommodation.photos && accommodation.photos.length > 0 && (
        <img
          src={accommodation.photos[0]}
          alt={accommodation.name}
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      )}
      <p>Name: {accommodation.name}</p>
      {accommodation.formatted_address && (
        <p>Address: {accommodation.formatted_address}</p>
      )}
      {accommodation.rating && <p>Rating: {accommodation.rating}</p>}
      {accommodation.website && (
        <a
          href={accommodation.website}
          target="_blank"
          rel="noopener noreferrer"
        >
          Website
        </a>
      )}
      {accommodation.opening_hours &&
        accommodation.opening_hours !== "Not available" &&
        accommodation.opening_hours.weekday_text && (
          <div>
            <p>Opening Hours:</p>
            <ul>
              {accommodation.opening_hours.weekday_text.map((day, index) => (
                <li key={index}>{day}</li>
              ))}
            </ul>
          </div>
        )}
      {accommodation.editorial_summary &&
        accommodation.editorial_summary.overview && (
          <p>Summary: {accommodation.editorial_summary.overview}</p>
        )}
      {accommodation.price_level && (
        <p>Price Level: {accommodation.price_level}</p>
      )}
      {accommodation.reviews && accommodation.reviews.length > 0 && (
        <div>
          <p>Reviews:</p>
          {accommodation.reviews.map((review, index) => (
            <div key={index}>
              <p>Author: {review.author}</p>
              <p>Rating: {review.rating}</p>
              <p>Text: {review.text}</p>
            </div>
          ))}
        </div>
      )}
      {accommodation.delivery && <p>Delivery: Yes</p>}
      {accommodation.dine_in && <p>Dine-in: Yes</p>}
      {accommodation.serves_beer && <p>Serves Beer: Yes</p>}
      {accommodation.serves_breakfast && <p>Serves Breakfast: Yes</p>}
      {accommodation.serves_dinner && <p>Serves Dinner: Yes</p>}
      {accommodation.serves_lunch && <p>Serves Lunch: Yes</p>}
      {accommodation.serves_vegetarian_food && <p>Vegetarian: Yes</p>}
      {accommodation.serves_wine && <p>Serves Wine: Yes</p>}
      {accommodation.takeout && <p>Takeout: Yes</p>}
      {accommodation.reservable && <p>Reservable: Yes</p>}
    </div>
  );
}

export default GoogleMapsHotelCard;
