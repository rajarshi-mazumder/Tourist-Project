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
        {hotelData?.map((accommodation) => (
          <div key={accommodation.name} className="carousel-item">
            <div className="carousel-card">
              <h3>{accommodation.name}</h3>
              {accommodation.photos && accommodation.photos.length > 0 && (
                <img
                  src={accommodation.photos[0]}
                  alt={accommodation.name}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
              )}
              <p>Name: {accommodation.name}</p>
              {accommodation.formatted_address && (
                <p>Address: {accommodation.formatted_address}</p>
              )}
              {accommodation.rating && <p>Rating: {accommodation.rating}</p>}
              {accommodation.website && (
                <a
                  href={accommodation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              )}
              {accommodation.opening_hours &&
                accommodation.opening_hours !== "Not available" &&
                accommodation.opening_hours.weekday_text && (
                  <div>
                    <p>Opening Hours:</p>
                    <ul>
                      {accommodation.opening_hours.weekday_text.map(
                        (day, index) => (
                          <li key={index}>{day}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              {accommodation.editorial_summary &&
                accommodation.editorial_summary.overview && (
                  <p>Summary: {accommodation.editorial_summary.overview}</p>
                )}
              {accommodation.price_level && (
                <p>Price Level: {accommodation.price_level}</p>
              )}
              {accommodation.reviews && accommodation.reviews.length > 0 && (
                <div>
                  <p>Reviews:</p>
                  {accommodation.reviews.map((review, index) => (
                    <div key={index}>
                      <p>Author: {review.author}</p>
                      <p>Rating: {review.rating}</p>
                      <p>Text: {review.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {accommodation.delivery && <p>Delivery: Yes</p>}
              {accommodation.dine_in && <p>Dine-in: Yes</p>}
              {accommodation.serves_beer && <p>Serves Beer: Yes</p>}
              {accommodation.serves_breakfast && <p>Serves Breakfast: Yes</p>}
              {accommodation.serves_dinner && <p>Serves Dinner: Yes</p>}
              {accommodation.serves_lunch && <p>Serves Lunch: Yes</p>}
              {accommodation.serves_vegetarian_food && <p>Vegetarian: Yes</p>}
              {accommodation.serves_wine && <p>Serves Wine: Yes</p>}
              {accommodation.takeout && <p>Takeout: Yes</p>}
              {accommodation.reservable && <p>Reservable: Yes</p>}
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default AccommodationCarousel;
