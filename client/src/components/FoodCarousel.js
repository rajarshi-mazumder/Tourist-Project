import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CityCarousel.css";

function FoodCarousel({ foodRecommendations }) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
  };

  if (!foodRecommendations) {
    return <div>No food recommendations available.</div>;
  }

  return (
    <div>
      <Slider {...settings}>
        {foodRecommendations.map((food) => (
          <div key={food.dish} className="carousel-item">
            <div className="carousel-card">
              <h3>{food.dish}</h3>
              <p>{food.description}</p>
              <img src={food.image_url} alt={food.dish} />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default FoodCarousel;
