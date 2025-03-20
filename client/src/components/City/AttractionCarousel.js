import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getMonthSeasonWeather } from "../../services/dateAndSeason/getDateAndSeason";
import "./AttractionCarousel.css"; // Import the new CSS file
import AttractionCard from "./AttractionCard";
import { base_url } from "../../services/apiServiceSetup";

function AttractionCarousel({ attractions, location }) {
  const [newAttractions, setNewAttractions] = useState([
    { "Suggested Attractions": attractions },
  ]);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [month, setMonth] = useState("");
  const [season, setSeason] = useState("");
  const [dailyForecast, setDailyForecast] = useState("");

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  const handleGetMoreAttractionsFromMaps = async () => {
    const data = await getMonthSeasonWeather(location);
    setMonth(data.month);
    setSeason(data.season);
    setDailyForecast(data.dailyForecast);

    const keywords = keywordsInput.split(",").map((keyword) => keyword.trim());

    const response = await fetch(`${base_url}/trip/attractions-from-maps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keywords,
        location,
        month: data.month,
        season: data.season,
        dailyForecast: data.dailyForecast,
      }),
    });

    const initialAttractions = await response.json();
    setNewAttractions([
      ...newAttractions,
      {
        [`Search results for: ${keywords.join(", ")}`]:
          initialAttractions.attractions,
      },
    ]);
  };

  return (
    <div className="attraction-carousel-container">
      {newAttractions.map((attraction, index) => (
        <div key={index} className="attraction-section">
          {Object.entries(attraction).map(([title, places]) => (
            <div key={title} className="attraction-row">
              <h3 className="attraction-title">{title}</h3>
              <div className="carousel-wrapper">
                <Carousel responsive={responsive} className="custom-carousel">
                  {places.map((place, idx) => (
                    <AttractionCard
                      key={idx}
                      attraction={place}
                      location={location}
                      keywords={keywordsInput.split(",").map((kw) => kw.trim())}
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

      <div className="attraction-search">
        <input
          type="text"
          className="keyword-input"
          placeholder="Enter keywords separated by commas"
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
        />
        <button
          className="search-button"
          onClick={handleGetMoreAttractionsFromMaps}
        >
          Get Attractions Data from Maps
        </button>
      </div>
    </div>
  );
}

export default AttractionCarousel;
