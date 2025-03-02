import React, { useState } from "react";

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
        googlePlacesData: [attraction], // Send one attraction at a time
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
  };

  return (
    <div className="attraction-card" key={enrichedAttraction.name}>
      <div className="attraction-image">
        {enrichedAttraction.images?.length > 0 && (
          <img
            src={enrichedAttraction.images[0]}
            alt={enrichedAttraction.name}
          />
        )}
      </div>
      <div className="attraction-details">
        <h3>{enrichedAttraction.name}</h3>
        {enrichedAttraction.address && (
          <p>Address: {enrichedAttraction.address}</p>
        )}
        {enrichedAttraction.region && (
          <p>Region: {enrichedAttraction.region}</p>
        )}
        {enrichedAttraction.reason && (
          <p>Reason: {enrichedAttraction.reason}</p>
        )}
        {enrichedAttraction.unique_things_to_do?.length > 0 && (
          <>
            <h4>Unique Things to Do:</h4>
            <ul>
              {enrichedAttraction.unique_things_to_do.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {enrichedAttraction.known_for?.length > 0 && (
          <>
            <h4>Known For:</h4>
            <ul>
              {enrichedAttraction.known_for.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}
        {enrichedAttraction.best_months_to_visit?.length > 0 && (
          <p>
            Best Months to Visit:{" "}
            {enrichedAttraction.best_months_to_visit.join(", ")}
          </p>
        )}
        {enrichedAttraction.seasonal_events?.length > 0 && (
          <p>
            Seasonal Events: {enrichedAttraction.seasonal_events.join(", ")}
          </p>
        )}
        {enrichedAttraction.recommended_for_weather && (
          <p>
            Recommended for Weather:{" "}
            {enrichedAttraction.recommended_for_weather}
          </p>
        )}
        {enrichedAttraction.links && (
          <>
            {enrichedAttraction.links.official_website && (
              <a
                href={enrichedAttraction.links.official_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official Website
              </a>
            )}
            {enrichedAttraction.links.google_maps && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  enrichedAttraction.name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Maps
              </a>
            )}
          </>
        )}
        <button onClick={fetchEnrichedData}>Enrich Attraction</button>
      </div>
    </div>
  );
};

export default AttractionCard;
