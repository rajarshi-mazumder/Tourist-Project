import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./AttractionCard.css"; // Import unified styles

const EnrichedAttractionDisplay = ({ place, enrichedAttraction, images }) => {
  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <div className="attraction-card" key={enrichedAttraction.name}>
      <div className="attraction-details">
        <h3 className="attraction-title">{enrichedAttraction.name}</h3>
        {enrichedAttraction.address && (
          <p className="attraction-info">
            Address: {enrichedAttraction.address}
          </p>
        )}
        {enrichedAttraction.region && (
          <p className="attraction-info">Region: {enrichedAttraction.region}</p>
        )}
        {enrichedAttraction.reason && (
          <p className="attraction-info">Reason: {enrichedAttraction.reason}</p>
        )}

        {enrichedAttraction.unique_things_to_do?.length > 0 && (
          <>
            <h4>Unique Things to Do:</h4>
            <ul>
              {enrichedAttraction.unique_things_to_do.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {enrichedAttraction.known_for?.length > 0 && (
          <>
            <h4>Known For:</h4>
            <ul>
              {enrichedAttraction.known_for.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {enrichedAttraction.best_months_to_visit?.length > 0 && (
          <p className="attraction-info">
            Best Months to Visit:{" "}
            {enrichedAttraction.best_months_to_visit.join(", ")}
          </p>
        )}

        {enrichedAttraction.seasonal_events?.length > 0 && (
          <p className="attraction-info">
            Seasonal Events: {enrichedAttraction.seasonal_events.join(", ")}
          </p>
        )}

        {enrichedAttraction.recommended_for_weather && (
          <p className="attraction-info">
            Recommended for Weather:{" "}
            {enrichedAttraction.recommended_for_weather}
          </p>
        )}

        {enrichedAttraction.links && (
          <>
            {enrichedAttraction.links.official_website && (
              <a
                className="map-link"
                href={enrichedAttraction.links.official_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
              </a>
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

            {enrichedAttraction.links.google_maps && (
              <a
                className="map-link"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  enrichedAttraction.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Maps
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnrichedAttractionDisplay;
