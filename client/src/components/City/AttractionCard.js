import React, { useState, useEffect } from "react";
import EnrichedAttractionDisplay from "./EnrichedAttractionDisplay";
import GoogleMapAttractionDisplay from "./GoogleMapAttractionDisplay";
import GeminiAttractionDisplay from "./GeminiAttractionDisplay";
import { base_url } from "../../services/apiServiceSetup";

const enrichAttraction = async (
  attraction,
  location,
  keywords,
  month,
  season,
  dailyForecast
) => {
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

  const enrichedData = await enrichResponse.json();
  console.log("Enriched Data:", enrichedData);

  // Fetch images
  try {
    const imageResponse = await fetch(
      `${base_url}/trip/images?q=${encodeURIComponent(attraction.name)}`
    );

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      enrichedData.attractions[0].images = imageData.map((image) => image.link);
    } else {
      console.error("Failed to fetch images:", imageResponse.status);
    }
  } catch (error) {
    console.error("Error fetching images:", error);
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
  }, [attraction, attraction.name, attraction.photos]);

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
    <div>
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
      ) : (
        <EnrichedAttractionDisplay
          enrichedAttraction={enrichedAttraction}
          images={images}
        />
      )}
      {!displayEnriched && (
        <button onClick={fetchEnrichedData}>Enrich Attraction</button>
      )}
    </div>
  );
};

export default AttractionCard;
