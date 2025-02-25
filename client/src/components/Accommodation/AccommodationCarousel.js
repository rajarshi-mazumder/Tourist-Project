import React, { useState, useEffect, useCallback } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "../City/CityCarousel.css";
import { BOOKING_COM_URL } from "../../constants";
import RakutenHotelCard from "./RakutenHotelCard";
import GoogleMapsHotelCard from "./GoogleMapsHotelCard";

function AccommodationCarousel({ accommodations, city }) {
  const [keywords, setKeywords] = useState("");
  const [rakutenHotelData, setRakutenHotelData] = useState(accommodations);
  const [googleMapsHotelData, setGoogleMapsHotelData] = useState([]);

  useEffect(() => {
    setRakutenHotelData(accommodations);
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
      const apiUrl = `http://localhost:4000/trip/hotels-from-maps`;
      console.log(`Fetching hotels from: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keyword: `${keywords} hotel`,
          location: city,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGoogleMapsHotelData([...googleMapsHotelData, data.places]);
    } catch (error) {
      console.error("Could not fetch hotels:", error);
    }
  }, [city, keywords, googleMapsHotelData]);

  if (!rakutenHotelData) {
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
        {rakutenHotelData?.map((accommodation) => (
          <div key={accommodation.hotelName} className="carousel-item">
            <RakutenHotelCard accommodation={accommodation} />
          </div>
        ))}
      </Carousel>
      {googleMapsHotelData.map((googleMapsHotels, index) => (
        <Carousel key={index} responsive={responsive}>
          {googleMapsHotels?.map((accommodation) => (
            <div
              key={accommodation.name}
              className="carousel-item"
              style={{ height: "800px" }}
            >
              <GoogleMapsHotelCard accommodation={accommodation} />
            </div>
          ))}
        </Carousel>
      ))}
    </div>
  );
}

export default AccommodationCarousel;
