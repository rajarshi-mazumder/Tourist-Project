import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getMonthSeasonWeather } from "../../services/dateAndSeason/getDateAndSeason";
import "./CityCarousel.css";

function AttractionCarousel({ attractions, location }) {
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

  if (!attractions) {
    return <div>No attractions available.</div>;
  }

  return (
    <div>
      <Carousel responsive={responsive}>
        {attractions.map((attraction) => (
          <div key={attraction.name} className="carousel-item">
            <div className="carousel-card">
              <h3>{attraction.name}</h3>
              <p>{attraction.description}</p>
              <img src={attraction.image_url} alt={attraction.name} />
            </div>
          </div>
        ))}
      </Carousel>

      <button
        onClick={async () => {
          const data = await getMonthSeasonWeather(location);
          const { month, season, dailyForecast } = data;

          const response = await fetch(
            "http://localhost:4000/trip/attractions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                location,
                keywords: [],
                month,
                season,
                dailyForecast,
              }),
            }
          );

          if (response.ok) {
            console.log("Attractions sent successfully!");
          } else {
            console.error("Failed to send attractions");
          }
        }}
      >
        Send Attractions Data
      </button>
    </div>
  );
}

export default AttractionCarousel;
