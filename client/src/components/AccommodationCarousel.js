import React, { useState, useEffect, useCallback } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./CityCarousel.css";
import { BOOKING_COM_URL } from "../constants";

function AccommodationCarousel({ accommodations, city }) {
  const [keywords, setKeywords] = useState("");
  const [hotelData, setHotelData] = useState(accommodations);

  useEffect(() => {
    setHotelData(accommodations);
  }, [accommodations]);

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const keywordOptions = [
    "贅沢", //Luxury
    "予算に優しい", //budget
    "家族", //Family
    "仕事", // Business
    "ロマンチック", // Romantic
    "ペット可", // pet friendly
  ];

  const handleKeywordChange = (e) => {
    const selectedKeyword = e.target.value;
    setKeywords(selectedKeyword);
  };

  const searchHotels = useCallback(async () => {
    try {
      const apiUrl = `http://localhost:4000/trip/hotels?cityName=${city}&keywords=${keywords}`;
      console.log(`Fetching hotels from: ${apiUrl}`);
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHotelData(data);
    } catch (error) {
      console.error("Could not fetch hotels:", error);
    }
  }, [city, keywords]);

  if (!hotelData) {
    return <div>No accommodations available.</div>;
  }

  return (
    <div>
      <div>
        {keywordOptions.map((option) => (
          <label key={option}>
            <input
              type="radio"
              value={option}
              checked={keywords === option}
              onChange={handleKeywordChange}
            />
            {option}
          </label>
        ))}
        <button onClick={searchHotels}>Search Hotels</button>
      </div>
      <Carousel responsive={responsive}>
        {hotelData.map((accommodation) => (
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
