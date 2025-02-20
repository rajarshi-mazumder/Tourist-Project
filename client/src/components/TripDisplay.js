import React from "react";
import "./TripDisplay.css";

function TripDisplay({ tripData }) {
  if (!tripData) {
    return <div>No trip data available.</div>;
  }

  const {
    trip_summary,
    transportation,
    accommodations,
    attractions,
    food_recommendations,
    travel_tips,
  } = tripData;

  return (
    <div className="trip-display">
      {/* Trip Summary */}
      <section className="trip-summary">
        <h2>Trip Summary</h2>
        {trip_summary && (
          <div className="summary-content">
            <h3>
              {trip_summary.from} to {trip_summary.to}
            </h3>
            <img
              src={trip_summary.image_url}
              alt="Trip"
              className="summary-image"
            />
            <p className="summary-description">
              {trip_summary.summary_description}
            </p>
            <p>
              <strong>Best Travel Options:</strong>{" "}
              {trip_summary.best_travel_options.join(", ")}
            </p>
            <p>
              <strong>Estimated Budget:</strong>{" "}
              {trip_summary.estimated_budget_range}
            </p>
          </div>
        )}
      </section>

      {/* Transportation */}
      <section className="transportation">
        <h2>Transportation</h2>
        {transportation &&
          transportation.map((route, index) => (
            <div key={index} className="route-container">
              {route.map((segment, segmentIndex) => (
                <div key={segmentIndex} className="transport-segment">
                  <img
                    src={segment.icon_url}
                    alt={`${segment.method} icon`}
                    className="transport-icon"
                  />
                  <div className="transport-details">
                    <span className="transport-method">{segment.method}</span>
                    <span className="transport-info">
                      {segment.service_provider &&
                        `${segment.service_provider} `}
                      {segment.service_number &&
                        `(Service: ${segment.service_number})`}
                    </span>
                    <span className="transport-route">
                      <strong>From:</strong> {segment.from}
                      {segment.from_platform &&
                        ` (Platform: ${segment.from_platform})`}
                    </span>
                    <span className="transport-route">
                      <strong>To:</strong> {segment.to}
                      {segment.to_platform &&
                        ` (Platform: ${segment.to_platform})`}
                    </span>
                    <span className="transport-duration">
                      <strong>Duration:</strong> {segment.duration}
                    </span>
                    <span className="transport-cost">
                      <strong>Cost:</strong> {segment.cost_range}
                    </span>
                    {segment.booking_link && segment.method !== "train" && (
                      <a
                        href={segment.booking_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="booking-link"
                      >
                        Book Now
                      </a>
                    )}
                  </div>
                  {segmentIndex < route.length - 1 && (
                    <span className="desktop-arrow">→</span>
                  )}
                  {segmentIndex < route.length - 1 && (
                    <span className="mobile-arrow">↓</span>
                  )}
                </div>
              ))}
            </div>
          ))}
      </section>

      {/* Accommodations */}
      <section className="accommodations">
        <h2>Accommodations</h2>
        {accommodations.length > 0 ? (
          accommodations.map((accommodation, index) => (
            <div key={index} className="accommodation-item">
              <h3>
                {accommodation.name} ({accommodation.type})
              </h3>
              <img
                src={accommodation.image_url}
                alt={accommodation.name}
                className="accommodation-image"
              />
              <p>
                <strong>Price Range:</strong> {accommodation.price_range}
              </p>
              <a
                href={accommodation.booking_link}
                className="booking-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Now
              </a>
            </div>
          ))
        ) : (
          <p>No accommodations available.</p>
        )}
      </section>

      {/* Attractions */}
      <section className="attractions">
        <h2>Attractions</h2>
        {attractions.length > 0 ? (
          attractions.map((attraction, index) => (
            <div key={index} className="attraction-item">
              <h3>{attraction.name}</h3>
              <img
                src={attraction.image_url}
                alt={attraction.name}
                className="attraction-image"
              />
              <p>{attraction.description}</p>
            </div>
          ))
        ) : (
          <p>No attractions available.</p>
        )}
      </section>

      {/* Food Recommendations */}
      <section className="food-recommendations">
        <h2>Food Recommendations</h2>
        {food_recommendations.length > 0 ? (
          food_recommendations.map((food, index) => (
            <div key={index} className="food-item">
              <h3>{food.name}</h3>
              <img
                src={food.image_url}
                alt={food.name}
                className="food-image"
              />
              <p>{food.description}</p>
            </div>
          ))
        ) : (
          <p>No food recommendations available.</p>
        )}
      </section>

      {/* Travel Tips */}
      <section className="travel-tips">
        <h2>Travel Tips</h2>
        {travel_tips.length > 0 ? (
          <ul className="travel-tips-list">
            {travel_tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p>No travel tips available.</p>
        )}
      </section>
    </div>
  );
}

export default TripDisplay;
