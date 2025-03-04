import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const GoogleMapAttractionDisplay = ({ place, images }) => {
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

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

      {images && (
        <div>
          <strong>Images:</strong>
          <Carousel responsive={responsive}>
            {images.map((image, index) => (
              <div key={index} className="carousel-image-container">
                <img
                  src={image.link}
                  alt="Attraction"
                  style={{
                    maxWidth: "100%",
                    height: "150px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </div>
            ))}
          </Carousel>
        </div>
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
