import React, { useState, useEffect } from "react";
import EnrichedAttractionDisplay from "./EnrichedAttractionDisplay";
import GoogleMapAttractionDisplay from "./GoogleMapAttractionDisplay";
import GeminiAttractionDisplay from "./GeminiAttractionDisplay";
import { base_url } from "../../services/apiServiceSetup";
import "./AttractionCard.css";

const SmartAttractionLoadingState = {
  NotStarted: "not_started",
  Loading: "loading",
  Completed: "completed",
  Failed: "failed",
};

const enrichAttraction = async (
  attraction,
  location,
  keywords,
  month,
  season,
  dailyForecast
) => {
  let enrichedData = {};
  try {
    const enrichResponse = await fetch(`${base_url}/trip/enrich-attractions`, {
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
    });
    enrichedData = await enrichResponse.json();
    console.log("Enriched Data:", enrichedData);
  } catch (error) {
    console.error(
      "Error fetching smart attraction for :",
      attraction.name,
      error
    );
    enrichedData.error = error;
    console.log("enrichAttraction failed", error);
    return null;
  }

  if (
    !enrichedData ||
    !enrichedData.attractions ||
    enrichedData.attractions.length === 0
  ) {
    console.warn(
      "No enriched attractions found, returning original attraction"
    );
    return attraction;
  }

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
  const [images, setImages] = useState([]);
  const [loadingSmartAttraction, setLoadingSmartAttraction] = useState(
    SmartAttractionLoadingState.NotStarted
  );

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          `${base_url}/trip/images?q=${encodeURIComponent(attraction.name)}`
        );

        if (response.ok) {
          const data = await response.json();
          setImages(data);
        } else {
          console.error("Failed to fetch images:", response.status);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    if (attraction.name) {
      fetchImages();
    }
  }, [attraction, attraction.name]);

  const fetchEnrichedData = async () => {
    setLoadingSmartAttraction(SmartAttractionLoadingState.Loading);
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
    if (enrichedData && enrichedData.error == null) {
      setLoadingSmartAttraction(SmartAttractionLoadingState.Completed);
    } else {
      setLoadingSmartAttraction(SmartAttractionLoadingState.Failed);
    }
  };

  useEffect(() => {
    fetchEnrichedData();
  }, []);

  return (
    <div className="attraction-card">
      {loadingSmartAttraction === SmartAttractionLoadingState.Loading && (
        <div>Enhancing using AI...</div>
      )}
      {attraction.type}
      {!displayEnriched ? (
        attraction.type === "gemini_attraction" ? (
          <GeminiAttractionDisplay attraction={attraction} images={images} />
        ) : attraction.type === "google_map_attraction" ? (
          <GoogleMapAttractionDisplay place={attraction} images={images} />
        ) : (
          <EnrichedAttractionDisplay
            place={attraction}
            enrichedAttraction={enrichedAttraction}
            images={images}
          />
        )
      ) : enrichedAttraction ? (
        <EnrichedAttractionDisplay
          enrichedAttraction={enrichedAttraction}
          images={images}
        />
      ) : null}
      {(loadingSmartAttraction === SmartAttractionLoadingState.NotStarted ||
        loadingSmartAttraction === SmartAttractionLoadingState.Failed) &&
        !displayEnriched && (
          <button onClick={fetchEnrichedData}>Enrich Attraction</button>
        )}
    </div>
  );
};

export default AttractionCard;
