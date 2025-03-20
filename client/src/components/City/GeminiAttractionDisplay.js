import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./AttractionCard.css"; // Import styles

const GeminiAttractionDisplay = ({ attraction, images }) => {
  const displayField = (fieldName, fieldValue) => {
    if (!fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0)) {
      return null;
    }

    if (fieldName === "Seasonal events" && Array.isArray(fieldValue)) {
      return (
        <div className="attraction-detail">
          <strong>{fieldName}:</strong>
          <ul>
            {fieldValue.map((event, index) => (
              <li key={index}>
                <strong>{event.name}</strong>
                {event.date_range ? (
                  <p>
                    Date Range: {event.date_range.start_date || "N/A"} -{" "}
                    {event.date_range.end_date || "N/A"}
                  </p>
                ) : (
                  <p>Date Range: N/A</p>
                )}
                <p>{event.description || "No description provided."}</p>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (Array.isArray(fieldValue)) {
      return (
        <div className="attraction-detail">
          <strong>{fieldName}:</strong>
          <ul>
            {fieldValue.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    if (typeof fieldValue === "object" && fieldValue !== null) {
      return (
        <div className="attraction-detail">
          <strong>{fieldName}:</strong>
          {fieldValue.official_website && (
            <p>
              Official Website:{" "}
              <a
                href={fieldValue.official_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                {fieldValue.official_website}
              </a>
            </p>
          )}
          {fieldValue.google_maps && (
            <p>
              Google Maps:{" "}
              <a
                href={fieldValue.google_maps}
                target="_blank"
                rel="noopener noreferrer"
              >
                {fieldValue.google_maps}
              </a>
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="attraction-detail">
        <strong>{fieldName}:</strong> {fieldValue}
      </div>
    );
  };

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <div className="attraction-card">
      <h3 className="attraction-title">{attraction.name}</h3>
      {displayField("Address", attraction.address)}
      {displayField("Region", attraction.region)}
      {displayField("Reason", attraction.reason)}
      {displayField("Unique things to do", attraction.unique_things_to_do)}
      {displayField("Known for", attraction.known_for)}
      {displayField("Best months to visit", attraction.best_months_to_visit)}
      {displayField("Seasonal events", attraction.seasonal_events)}
      {displayField(
        "Recommended for weather",
        attraction.recommended_for_weather
      )}
      {displayField("Links", attraction.links)}

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
    </div>
  );
};

export default GeminiAttractionDisplay;
