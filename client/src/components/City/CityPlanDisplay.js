import React, { useEffect } from "react";
import "./CityPlanDisplay.css";
import AccommodationCarousel from "../Accommodation/AccommodationCarousel.js";
import AttractionCarousel from "./AttractionCarousel.js";
import FoodCarousel from "./FoodCarousel.js";
import { useCityImage } from "../../context/CityImageContext.js";
import { base_url } from "../../services/apiServiceSetup.js";

const CityPlanDisplay = ({
  tripPlans,
  setExpandedPlanIndex,
  expandedPlanIndex,
}) => {
  return (
    <div className="city-plan-container">
      <h2>Trip Plans</h2>
      {tripPlans.map((plan, index) => {
        return (
          <div key={index} className="city-plan-item">
            <button
              onClick={() =>
                setExpandedPlanIndex(expandedPlanIndex === index ? null : index)
              }
            >
              {plan.city}
              {expandedPlanIndex === index ? "▲" : "▼"}
            </button>
            {expandedPlanIndex === index && (
              <>
                <PlanDetails cityPlan={plan} key={index} />
                <button onClick={() => setExpandedPlanIndex(null)}>▲</button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PlanDetails = ({ cityPlan }) => {
  const { cityImages, setCityImages } = useCityImage();

  useEffect(() => {
    const fetchCityImages = async (city) => {
      try {
        const response = await fetch(
          `${base_url}/trip/images?q=${cityPlan.city}+japan`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCityImages((prevImages) => ({ ...prevImages, [city]: data }));
      } catch (error) {
        console.error("Failed to fetch city images:", error);
        setCityImages((prevImages) => ({
          ...prevImages,
          [city]: [{ thumbnail: "error", alt: "Failed to load" }],
        }));
      }
    };

    if (cityPlan && !cityImages[cityPlan.city]) {
      fetchCityImages(cityPlan.city);
    }
  }, [cityPlan, cityImages, setCityImages]);

  if (!cityPlan) {
    return <div>No city plan available.</div>;
  }

  return (
    <div className="city-plan-details">
      <h2>{cityPlan.city}</h2>
      <p>Trip Duration: {cityPlan.trip_duration}</p>
      <p>{cityPlan.city_description}</p>

      <div className="city-images">
        {cityImages[cityPlan.city] ? (
          cityImages[cityPlan.city].map((imageUrl, index) => (
            <img key={index} src={imageUrl.thumbnail} alt={cityPlan.city} />
          ))
        ) : (
          <div>Loading images...</div>
        )}
      </div>

      <h3>Accommodations</h3>
      <AccommodationCarousel
        accommodations={cityPlan.accommodations}
        city={cityPlan.city}
      />

      <h3>Attractions</h3>
      <AttractionCarousel
        attractions={cityPlan.attractions}
        location={cityPlan.city}
      />

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
