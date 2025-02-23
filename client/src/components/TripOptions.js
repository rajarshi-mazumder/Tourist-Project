import React, { useState } from "react";

function TripOptions({ setCities }) {
  const [days, setDays] = useState(10);

  const fetchCities = async () => {
    const response = await fetch("http://localhost:4000/trip/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country_name: "japan",
        days: days,
      }),
    });
    const data = await response.json();
    console.log(data);
    setCities(data.recommended_places);
  };

  return (
    <div>
      <div>
        <label>
          Days:
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
      </div>
      <button onClick={fetchCities}>Start Planning</button>
    </div>
  );
}

export default TripOptions;
