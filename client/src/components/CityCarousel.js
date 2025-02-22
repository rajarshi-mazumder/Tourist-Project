import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CityCarousel({ cities }) {
  const [expandedCity, setExpandedCity] = useState(null);
  const [cityImages, setCityImages] = useState({});

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
  };

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
    </div>
  );
}

export default CityCarousel;
