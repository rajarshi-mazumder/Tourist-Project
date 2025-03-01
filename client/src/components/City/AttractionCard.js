import React from "react";

const AttractionCard = ({ attraction }) => {
  console.log("HII");
  return (
    <div className="attraction-card" key={attraction.name}>
      <div className="attraction-image">
        {attraction.images && attraction.images.length > 0 && (
          <img src={attraction.images[0]} alt={attraction.name} />
        )}
      </div>
      <div className="attraction-details">
        <h3>{attraction.name}</h3>
        {attraction.address && <p>Address: {attraction.address}</p>}
        {attraction.region && <p>Region: {attraction.region}</p>}
        {attraction.reason && <p>Reason: {attraction.reason}</p>}
        {attraction.unique_things_to_do &&
          attraction.unique_things_to_do.length > 0 && (
            <>
              <h4>Unique Things to Do:</h4>
              <ul>
                {attraction.unique_things_to_do.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}
        {attraction.known_for && attraction.known_for.length > 0 && (
          <>
            <h4>Known For:</h4>
            <ul>
              {attraction.known_for.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {attraction.best_months_to_visit &&
          attraction.best_months_to_visit.length > 0 && (
            <p>
              Best Months to Visit: {attraction.best_months_to_visit.join(", ")}
            </p>
          )}
        {attraction.seasonal_events &&
          attraction.seasonal_events.length > 0 && (
            <p>Seasonal Events: {attraction.seasonal_events.join(", ")}</p>
          )}
        {attraction.recommended_for_weather && (
          <p>Recommended for Weather: {attraction.recommended_for_weather}</p>
        )}
        {attraction.links && (
          <>
            {attraction.links.official_website && (
              <a
                href={attraction.links.official_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
              </a>
            )}
            <br />
            {attraction.links && attraction.links.google_maps && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  attraction.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttractionCard;
