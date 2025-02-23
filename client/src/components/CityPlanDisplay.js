import React from "react";
import "./CityPlanDisplay.css";
import AccommodationCarousel from "./AccommodationCarousel";
import AttractionCarousel from "./AttractionCarousel";
import FoodCarousel from "./FoodCarousel";

const CityPlanDisplay = ({ cityPlan }) => {
  if (!cityPlan) {
    return <div>No city plan available.</div>;
  }

  return (
    <div className="city-plan-container">
      <h2>{cityPlan.city}</h2>
      <p>Trip Duration: {cityPlan.trip_duration}</p>
      <p>{cityPlan.city_description}</p>

      <div className="city-images">
        {cityPlan.city_images.map((imageUrl, index) => (
          <img key={index} src={imageUrl} alt={cityPlan.city} />
        ))}
      </div>

      <h3>Accommodations</h3>
      <AccommodationCarousel accommodations={cityPlan.accommodations} />

      <h3>Attractions</h3>
      <AttractionCarousel attractions={cityPlan.attractions} />

      <h3>Food Recommendations</h3>
      <FoodCarousel foodRecommendations={cityPlan.food_recommendations} />

      <h3>Transportation</h3>
      <div className="transportation">
        <p>Getting Around: {cityPlan.transportation.getting_around}</p>
        <h4>Major Transport Hubs</h4>
        <ul>
          {cityPlan.transportation.major_transport_hubs.map((hub, index) => (
            <li key={index}>{hub}</li>
          ))}
        </ul>
        <h4>Cost Estimates</h4>
        <p>
          Subway Ticket: {cityPlan.transportation.cost_estimates.subway_ticket}
        </p>
        <p>
          Taxi Starting Fare:{" "}
          {cityPlan.transportation.cost_estimates.taxi_starting_fare}
        </p>
        <p>Day Pass: {cityPlan.transportation.cost_estimates.day_pass}</p>
      </div>

      <h3>Travel Tips</h3>
      <div className="travel-tips">
        <ul>
          {cityPlan.travel_tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CityPlanDisplay;
