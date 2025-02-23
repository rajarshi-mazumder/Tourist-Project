import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import TripDisplay from "./TripDisplay"; // Import TripDisplay

function CityCarousel({ cities }) {
  const [expandedCity, setExpandedCity] = useState(null);
  const [cityImages, setCityImages] = useState({});
  const [previousCity, setPreviousCity] = useState(null);
  const [tripPlans, setTripPlans] = useState([]); // Explicitly initialize to []

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
  };
  useEffect(() => {
    console.log("Trip Plans:", tripPlans);
  }, [tripPlans]);
  const fetchCityImages = async (city) => {
    const response = await fetch(
      `http://localhost:4000/trip/images?q=${city.name}+japan`
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
      const response = await fetch("http://localhost:4000/trip/plan-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_city: fromCity,
          to_city: toCity,
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
      <Slider {...settings}>
        {cities.map((city) => (
          <div key={city.name} className="city-card">
            <h3>{city.name}</h3>
            <p>{city.description}</p>
            <button onClick={() => toggleExpand(city)}>
              {expandedCity === city.name ? "▲" : "▼"}
            </button>
            <button onClick={() => planTrip(city)}>Plan Here</button>
            {expandedCity === city.name && (
              <div className="image-carousel-container">
                {cityImages[city.name] ? (
                  <Slider {...settings}>
                    {cityImages[city.name].map((image, index) => (
                      <div key={index} className="image-slide">
                        <img src={image.thumbnail} alt={image.title} />
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <div>Loading images...</div>
                )}
              </div>
            )}
          </div>
        ))}
      </Slider>
      <h2>Trip Plans</h2>
      <Slider {...settings}>
        {tripPlans.map((plan, index) => (
          <div key={index}>
            <TripDisplay tripData={plan} />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CityCarousel;
