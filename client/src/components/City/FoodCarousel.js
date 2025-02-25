import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./CityCarousel.css";

function FoodCarousel({ foodRecommendations }) {
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

  if (!foodRecommendations) {
    return <div>No food recommendations available.</div>;
  }

  return (
    <div>
      <Carousel responsive={responsive}>
        {foodRecommendations.map((food) => (
          <div key={food.dish} className="carousel-item">
            <div className="carousel-card">
              <h3>{food.dish}</h3>
              <p>{food.description}</p>
              <img src={food.image_url} alt={food.dish} />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default FoodCarousel;
