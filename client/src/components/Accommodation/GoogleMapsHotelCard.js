import React from "react";
import { BOOKING_COM_URL } from "../../constants";

function GoogleMapsHotelCard({
  accommodation,
  city,
  fetchHotelPrice,
  hotelPrices,
}) {
  const hotelName = accommodation.name;
  const priceData = hotelPrices[hotelName];

  return (
    <div className="carousel-card">
      <h3>{accommodation.name}
      {priceData ? (
        priceData.error ? (
          <p>{priceData.error}</p>
        ) : (
          <p>
            Price: {priceData.price_per_night} {priceData.currency}
          </p>
        )
      ) : (
        <button onClick={() => fetchHotelPrice(hotelName, city)}>
          Show Price
        </button>
      )}
      </h3>
      {accommodation.photos && accommodation.photos.length > 0 && (
        <img
          src={accommodation.photos[0]}
          alt={accommodation.name}
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      )}
      <p>Name: {accommodation.name}</p>
      <a
        href={`${BOOKING_COM_URL}${accommodation.name}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        More information
      </a>
      {accommodation.formatted_address && (
        <p>Address: {accommodation.formatted_address}</p>
      )}
      {accommodation.rating && <p>Rating: {accommodation.rating}</p>}
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
      {accommodation.description && (
        <p>Description: {accommodation.description}</p>
      )}
      {accommodation.formatted_phone_number && (
        <p>Phone: {accommodation.formatted_phone_number}</p>
      )}
      {accommodation.website && (
        <p>
          Website: <a href={accommodation.website}>{accommodation.website}</a>
        </p>
      )}
      {accommodation.price_level && (
        <p>Price Level: {accommodation.price_level}</p>
      )}
      {accommodation.serves_beer && (
        <p>Serves Beer: {accommodation.serves_beer ? "Yes" : "No"}</p>
      )}
      {accommodation.serves_breakfast && (
        <p>Serves Breakfast: {accommodation.serves_breakfast ? "Yes" : "No"}</p>
      )}
      {accommodation.serves_dinner && (
        <p>Serves Dinner: {accommodation.serves_dinner ? "Yes" : "No"}</p>
      )}
      {accommodation.serves_lunch && (
        <p>Serves Lunch: {accommodation.serves_lunch ? "Yes" : "No"}</p>
      )}
      {accommodation.serves_vegetarian_food && (
        <p>Vegetarian: {accommodation.serves_vegetarian_food ? "Yes" : "No"}</p>
      )}
      {accommodation.serves_wine && (
        <p>Serves Wine: {accommodation.serves_wine ? "Yes" : "No"}</p>
      )}
      {accommodation.takeout && (
        <p>Takeout: {accommodation.takeout ? "Yes" : "No"}</p>
      )}
      {accommodation.delivery && (
        <p>Delivery: {accommodation.delivery ? "Yes" : "No"}</p>
      )}
      {accommodation.dine_in && (
        <p>Dine-in: {accommodation.dine_in ? "Yes" : "No"}</p>
      )}
      {accommodation.reservable && (
        <p>Reservable: {accommodation.reservable ? "Yes" : "No"}</p>
      )}
      {accommodation.editorial_summary &&
        accommodation.editorial_summary.overview && (
          <p>Summary: {accommodation.editorial_summary.overview}</p>
        )}

      {accommodation.cuisine && <p>Cuisine: {accommodation.cuisine}</p>}
      {accommodation.seating && <p>Seating: {accommodation.seating}</p>}
      {accommodation.reservation_required && (
        <p>Reservation Required: {accommodation.reservation_required}</p>
      )}
      {accommodation.ranking && (
        <p>
          Ranking: {accommodation.ranking.rank} - {accommodation.ranking.reason}
        </p>
      )}
      {accommodation.walking_distance && (
        <p>Walking Distance: {accommodation.walking_distance}</p>
      )}
      {accommodation.walking_duration && (
        <p>Walking Duration: {accommodation.walking_duration}</p>
      )}
    </div>
  );
}

export default GoogleMapsHotelCard;
