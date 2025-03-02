import React, { useState } from "react";
import EnrichedAttractionDisplay from "./EnrichedAttractionDisplay";
import GoogleMapPlacesDisplay from "./GoogleMapPlacesDisplay";

const enrichAttraction = async (
  attraction,
  location,
  keywords,
  month,
  season,
  dailyForecast
) => {
  const enrichResponse = await fetch(
    "http://localhost:4000/trip/enrich-attractions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location: location,
        keywords: keywords,
        month: month,
        season: season,
        dailyForecast: dailyForecast,
        googlePlacesData: [attraction],
      }),
    }
  );

  const enrichedData = await enrichResponse.json();
  console.log("Enriched Data:", enrichedData);
  return enrichedData.attractions[0];
};

const AttractionCard = ({
  attraction,
  location,
  keywords,
  month,
  season,
  dailyForecast,
}) => {
  const [enrichedAttraction, setEnrichedAttraction] = useState(attraction);
  const [displayEnriched, setDisplayEnriched] = useState(false);

  const fetchEnrichedData = async () => {
    const enrichedData = await enrichAttraction(
      attraction,
      location,
      keywords,
      month,
      season,
      dailyForecast
    );
    setEnrichedAttraction(enrichedData);
    setDisplayEnriched(true);
  };

  return (
    <>
      {!displayEnriched ? (
        <GoogleMapPlacesDisplay place={attraction} />
      ) : (
        <EnrichedAttractionDisplay enrichedAttraction={enrichedAttraction} />
      )}
      {!displayEnriched && (
        <button onClick={fetchEnrichedData}>Enrich Attraction</button>
      )}
    </>
  );
};

export default AttractionCard;
