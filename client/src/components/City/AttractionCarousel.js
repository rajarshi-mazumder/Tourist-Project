import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getMonthSeasonWeather } from "../../services/dateAndSeason/getDateAndSeason";
import "./CityCarousel.css";
import AttractionCard from "./AttractionCard";

function AttractionCarousel({ attractions, location }) {
  const [newAttractions, setNewAttractions] = useState([...attractions]);
  const [x, setX] = React.useState("1");

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

  const handleGetMoreAttractions = async () => {
    const data = await getMonthSeasonWeather(location);
    const { month, season, dailyForecast } = data;

    const response = await fetch("http://localhost:4000/trip/attractions", {
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
    });

    const newAttractionsData = await response.json();
    setNewAttractions([...attractions, ...newAttractionsData.attractions]); // Store fetched attractions
  };

  return (
    <div>
      hii
      {x != null && <div>{JSON.stringify(newAttractions.length)}</div>}
      <Carousel responsive={responsive}>
        {newAttractions.map((attraction, index) => (
          <AttractionCard
            key={`${attraction.name}-${index}`}
            attraction={attraction}
          />
        ))}
      </Carousel>
      <button
        onClick={() => {
          handleGetMoreAttractions();
          setX("40");
        }}
      >
        More Attractions Data
      </button>
    </div>
  );
}

export default AttractionCarousel;
