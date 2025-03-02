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
  const [month, setMonth] = useState("");
  const [season, setSeason] = useState("");
  const [dailyForecast, setDailyForecast] = useState("");

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

  const handleGetMoreAttractionsFromMaps = async () => {
    const data = await getMonthSeasonWeather(location);
    const {
      month: newMonth,
      season: newSeason,
      dailyForecast: newDailyForecast,
    } = data;
    setMonth(newMonth);
    setSeason(newSeason);
    setDailyForecast(newDailyForecast);

    const keywords = keywordsInput.split(",").map((keyword) => keyword.trim());

    const response = await fetch(
      "http://localhost:4000/trip/attractions-from-maps",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: keywords,
          location,
          month,
          season,
          dailyForecast,
        }),
      }
    );

    const initialAttractions = await response.json();
    console.log("Initial Attractions from Maps:", initialAttractions);

    const concatenatedKeyword = "Search results for : " + keywords;
    setNewAttractions([
      ...newAttractions,
      { [concatenatedKeyword]: initialAttractions.attractions },
    ]);
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
                    <AttractionCard
                      attraction={attraction}
                      location={location}
                      keywords={keywordsInput
                        .split(",")
                        .map((keyword) => keyword.trim())}
                      month={month}
                      season={season}
                      dailyForecast={dailyForecast}
                    />
                  ))}
                </Carousel>
              </div>
            </div>
          ))}
        </div>
      ))}

      <input
        type="text"
        placeholder="Enter keywords separated by commas"
        value={keywordsInput}
        onChange={(e) => setKeywordsInput(e.target.value)}
      />
      <br />
      <button
        onClick={() => {
          handleGetMoreAttractionsFromMaps();
        }}
      >
        Get Attractions Data from maps
      </button>
    </div>
  );
}

export default AttractionCarousel;
