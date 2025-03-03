import React from "react";

const GoogleMapAttractionDisplay = ({ place }) => {
  return (
    <div className="google-map-place">
      <h3>{place.name}</h3>
      <p>Address: {place.formatted_address}</p>
      <p>Business Status: {place.business_status}</p>
      <p>
        Rating: {place.rating} ({place.user_ratings_total} ratings)
      </p>
      <p>Price Level: {place.price_level}</p>
      {place.opening_hours && place.opening_hours.open_now !== undefined && (
        <p>Open Now: {place.opening_hours.open_now ? "Yes" : "No"}</p>
      )}
      {place.photos && place.photos.length > 0 && (
        <img
          src={
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=YOUR_API_KEY` /* Replace YOUR_API_KEY */
          }
          alt={place.name}
        />
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          place.name + " " + place.formatted_address
        )}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Google Maps
      </a>
    </div>
  );
};

export default GoogleMapAttractionDisplay;
