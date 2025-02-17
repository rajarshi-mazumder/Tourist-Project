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
              {trip_summary.best_travel_options}
            </p>
            <p>
              <strong>Estimated Budget:</strong>{" "}
              {trip_summary.estimated_budget_range}
            </p>
          </div>
        )}
      </section>

      <section className="transportation">
        <h2>Transportation</h2>
        {transportation &&
          transportation.map((transportOptions, index) => (
            <div key={index} className="transport-options">
              {transportOptions.map((transport, transportIndex) => (
                <span key={transportIndex} className="transport-item">
                  {transportIndex > 0 && " → "}
                  {transport.method} ({transport.duration},{" "}
                  {transport.cost_range})
                </span>
              ))}
            </div>
          ))}
      </section>

      <section className="accommodations">
        <h2>Accommodations</h2>
        {accommodations &&
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
          ))}
      </section>

      <section className="attractions">
        <h2>Attractions</h2>
        {attractions &&
          attractions.map((attraction, index) => (
            <div key={index} className="attraction-item">
              <h3>{attraction.name}</h3>
              <img
                src={attraction.image_url}
                alt={attraction.name}
                className="attraction-image"
              />
              <p>{attraction.description}</p>
              <p>
                <strong>Entry Fee:</strong> {attraction.entry_fee}
              </p>
              <p>
                <strong>Opening Hours:</strong> {attraction.opening_hours}
              </p>
            </div>
          ))}
      </section>

      <section className="food-recommendations">
        <h2>Food Recommendations</h2>
        {food_recommendations &&
          food_recommendations.map((food, index) => (
            <div key={index} className="food-item">
              <h3>{food.name}</h3>
              <img
                src={food.image_url}
                alt={food.name}
                className="food-image"
              />
              <p>{food.description}</p>
              <p>
                <strong>Restaurant Recommendation:</strong>{" "}
                {food.restaurant_recommendation}
              </p>
            </div>
          ))}
      </section>

      <section className="travel-tips">
        <h2>Travel Tips</h2>
        {travel_tips && (
          <ul className="travel-tips-list">
            {travel_tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default TripDisplay;
