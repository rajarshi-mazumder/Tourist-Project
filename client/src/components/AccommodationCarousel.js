import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./CityCarousel.css";
import { BOOKING_COM_URL } from "../constants";

function AccommodationCarousel({ accommodations }) {
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

  if (!accommodations) {
    return <div>No accommodations available.</div>;
  }

  return (
    <div>
      <Carousel responsive={responsive}>
        {accommodations.map((accommodation) => (
          <div key={accommodation.hotelName} className="carousel-item">
            <div className="carousel-card">
              <h3>{accommodation.hotelName}</h3>
              <img
                src={accommodation.hotelImageUrl}
                alt={accommodation.hotelName}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <p>Name: {accommodation.hotelName}</p>
              <a
                href={`${BOOKING_COM_URL}${accommodation.hotelName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                More Information
              </a>
              <img
                src={accommodation.hotelThumbnailUrl}
                alt={accommodation.hotelName}
                style={{ width: "100%", height: "100px", objectFit: "cover" }}
              />
              <p>
                Address: {accommodation.address1}, {accommodation.address2}
              </p>
              <p>Telephone: {accommodation.telephoneNo}</p>
              <p>Access: {accommodation.access}</p>
              <p>Min Charge: {accommodation.hotelMinCharge}</p>
              <p>
                Reviews: {accommodation.reviewCount} (
                {accommodation.reviewAverage})
              </p>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default AccommodationCarousel;
