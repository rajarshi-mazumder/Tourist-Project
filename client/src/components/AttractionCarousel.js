import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CityCarousel.css";

function AttractionCarousel({ attractions }) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
  };

  if (!attractions) {
    return <div>No attractions available.</div>;
  }

  return (
    <div>
      <Slider {...settings}>
        {attractions.map((attraction) => (
          <div key={attraction.name} className="carousel-item">
            <div className="carousel-card">
              <h3>{attraction.name}</h3>
              <p>{attraction.description}</p>
              <img src={attraction.image_url} alt={attraction.name} />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default AttractionCarousel;
