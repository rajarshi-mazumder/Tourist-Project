import React from "react";

const GeminiAttractionDisplay = ({ attraction }) => {
  return (
    <div>
      <h3>{attraction.name}</h3>
      <p>{attraction.address}</p>
      <p>{attraction.reason}</p>
      {/* Add more details here based on the Gemini attraction structure */}
    </div>
  );
};

export default GeminiAttractionDisplay;
