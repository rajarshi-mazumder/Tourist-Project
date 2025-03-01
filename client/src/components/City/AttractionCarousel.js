import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getMonthSeasonWeather } from "../../services/dateAndSeason/getDateAndSeason";
import "./CityCarousel.css";
import AttractionCard from "./AttractionCard";

function AttractionCarousel({ attractions, location }) {
  const [newAttractions, setNewAttractions] = useState([
    { "Suggested Attractions": attractions },
  ]);
  const [keywordsInput, setKeywordsInput] = useState("");

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

    const keywords = keywordsInput.split(",").map((keyword) => keyword.trim());

    const response = await fetch("http://localhost:4000/trip/attractions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location,
        keywords: keywords,
        month,
        season,
        dailyForecast,
      }),
    });

    const newAttractionsData = await response.json();
    const concatenatedKeyword = "Search results for :" + keywords;
    setNewAttractions([
      ...newAttractions,
      { [concatenatedKeyword]: newAttractionsData.attractions },
    ]); // Store fetched attractions
  };

  return (
    <div>
      {newAttractions.map((attraction) => (
        <div>
          {Object.entries(attraction).map(([key, value]) => (
            <div className="attraction-row">
              {key}
              <div>
                {/* {JSON.stringify(value)} */}
                <Carousel responsive={responsive}>
                  {value.map((attraction) => (
                    <AttractionCard attraction={attraction} />
                  ))}
                </Carousel>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() => {
          handleGetMoreAttractions();
        }}
      >
        More Attractions Data
      </button>
      <input
        type="text"
        placeholder="Enter keywords separated by commas"
        value={keywordsInput}
        onChange={(e) => setKeywordsInput(e.target.value)}
      />
    </div>
  );
}

export default AttractionCarousel;
