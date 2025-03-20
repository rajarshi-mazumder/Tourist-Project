import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./AttractionCard.css"; // Import unified styles

const GoogleMapAttractionDisplay = ({ place, images }) => {
  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <div className="attraction-card">
      <h3 className="attraction-title">{place.name}</h3>
      <p className="attraction-info">Address: {place.formatted_address}</p>
      <p className="attraction-info">
        Business Status: {place.business_status}
      </p>
      <p className="attraction-info">
        Rating: {place.rating} ({place.user_ratings_total} ratings)
      </p>
      <p className="attraction-info">Price Level: {place.price_level}</p>
      {place.opening_hours && place.opening_hours.open_now !== undefined && (
        <p className="attraction-info">
          Open Now: {place.opening_hours.open_now ? "Yes" : "No"}
        </p>
      )}

      {images.length > 0 && (
        <div className="carousel-wrapper">
          <strong>Images:</strong>
          <Carousel responsive={responsive} className="custom-carousel">
            {images.map((image, index) => (
              <div key={index} className="carousel-image-container">
                <img
                  src={image.link}
                  alt="Attraction"
                  className="attraction-image"
                />
              </div>
            ))}
          </Carousel>
        </div>
      )}

      <a
        className="map-link"
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
