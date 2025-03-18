import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./CityCarousel.css";
import CityPlanDisplay from "./CityPlanDisplay";
import { useCityImage } from "../../context/CityImageContext.js";
import { base_url } from "../../services/apiServiceSetup.js";

function CityCarousel({ cities }) {
  const [expandedCity, setExpandedCity] = useState(null);
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);
  const { cityImages, setCityImages } = useCityImage();
  const [previousCity, setPreviousCity] = useState(null);
  const [tripPlans, setTripPlans] = useState([]); // Explicitly initialize to []

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };
  useEffect(() => {
    console.log("Trip Plans:", tripPlans);
  }, [tripPlans]);
  const fetchCityImages = async (city) => {
    const response = await fetch(
      `${base_url}/trip/images?q=${city.name}+japan`
    );
    const data = await response.json();
    setCityImages((prevImages) => ({ ...prevImages, [city.name]: data }));
  };

  const toggleExpand = (city) => {
    if (expandedCity === city.name) {
      setExpandedCity(null);
    } else {
      setExpandedCity(city.name);
      if (!cityImages[city.name]) {
        fetchCityImages(city);
      }
    }
  };

  if (!cities) {
    return <div>No cities available.</div>;
  }

  const planTrip = async (city) => {
    const toCity = city.name;
    const fromCity = previousCity ? previousCity : "tokyo";

    try {
      const response = await fetch(`${base_url}/trip/city-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityName: toCity,
          days: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data from API:", data);
      setTripPlans((prevPlans) => [...prevPlans, data]);
      setPreviousCity(toCity);
    } catch (error) {
      console.error("Error planning trip:", error);
    }
    console.log("From City:", fromCity, "To City:", toCity);
  };

  return (
    <div>
      <h2>Recommended Cities</h2>
      <Carousel responsive={responsive}>
        {cities.map((city) => (
          <div key={city.name} className="carousel-item">
            <div className="carousel-card">
              <h3>{city.name}</h3>
              <p>{city.description}</p>
              <button onClick={() => toggleExpand(city)}>
                {expandedCity === city.name ? "▲" : "▼"}
              </button>
              <button onClick={() => planTrip(city)}>Plan Here</button>
              {expandedCity === city.name && (
                <div className="image-carousel-container">
                  {cityImages[city.name] ? (
                    <Carousel responsive={responsive}>
                      {cityImages[city.name].map((image, index) => (
                        <div key={index} className="image-slide">
                          <img src={image.thumbnail} alt={image.title} />
                        </div>
                      ))}
                    </Carousel>
                  ) : (
                    <div>Loading images...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </Carousel>
      <CityPlanDisplay
        tripPlans={tripPlans}
        setExpandedPlanIndex={setExpandedPlanIndex}
        expandedPlanIndex={expandedPlanIndex}
      />
    </div>
  );
}

export default CityCarousel;
