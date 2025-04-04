import React, { useState } from "react";
import { base_url } from "../../services/apiServiceSetup";

function TripForm({ setTripData }) {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [days, setDays] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${base_url}/trip/plan-trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_city: fromCity,
          to_city: toCity,
          days: days,
        }),
      });

      const data = await response.json();
      setTripData(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h2>Trip Form</h2>
      <form onSubmit={handleSubmit}>
        <label>
          From:
          <input
            type="text"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
          />
        </label>
        <br />
        <label>
          To:
          <input
            type="text"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
          />
        </label>
        <br />
        <label>
          Days:
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default TripForm;
