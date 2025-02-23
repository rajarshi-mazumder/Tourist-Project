import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./CityCarousel.css";

function AccommodationCarousel({ accommodations }) {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: false,
  };

  if (!accommodations) {
    return <div>No accommodations available.</div>;
  }

  return (
    <div>
      <Slider {...settings}>
        {accommodations.map((accommodation) => (
          <div key={accommodation.hotelName} className="carousel-item">
            <div className="carousel-card">
              <h3>{accommodation.hotelName}</h3>
              <img
                src={accommodation.hotelImageUrl}
                alt={accommodation.hotelName}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default AccommodationCarousel;
