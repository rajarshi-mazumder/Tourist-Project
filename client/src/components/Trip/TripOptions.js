import React, { useState } from "react";
import CityPlanDisplay from "../../components/City/CityPlanDisplay";
import japanPlaces from "../../schemas/japanPlaces.json";
import { base_url } from "../../services/apiServiceSetup";

function TripOptions({ setCities }) {
  const [days, setDays] = useState(10);
  const [tripPlans, setTripPlans] = useState([]);
  const [previousCity, setPreviousCity] = useState(null);
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);

  const places = japanPlaces.places[0];

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filtered = Object.entries(places).filter(([key, place]) =>
      place.eng.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPlaces(filtered);
  };

  const planTrip = async (city) => {
    const toCity = city;
    const fromCity = previousCity ? previousCity : "tokyo";

    try {
      const response = await fetch(`${base_url}/trip/city-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cityName: toCity,
          days: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data from API:", data);
      setTripPlans((prevPlans) => [...prevPlans, data]);
      setPreviousCity(toCity);
    } catch (error) {
      console.error("Error planning trip:", error);
    }
    console.log("From City:", fromCity, "To City:", toCity);
  };

  const handleSelectItem = (key) => {
    setSearchTerm(key);
    setFilteredPlaces([]);
  };

  const fetchCities = async () => {
    const response = await fetch(`${base_url}/trip/cities`, {
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
        <button onClick={fetchCities}>Start Planning</button>
      </div>
      <div>
        <label>
          Search Places :
          <input type="text" value={searchTerm} onChange={handleSearch} />
          {filteredPlaces.length > 0 && (
            <ul>
              {filteredPlaces.map(([key, place]) => (
                <li key={key} onClick={() => handleSelectItem(key)}>
                  {place.eng}
                </li>
              ))}
            </ul>
          )}
        </label>
        <button onClick={() => planTrip(searchTerm)}>
          Plan to {searchTerm}
        </button>
      </div>
      <CityPlanDisplay
        tripPlans={tripPlans}
        setExpandedPlanIndex={setExpandedPlanIndex}
        expandedPlanIndex={expandedPlanIndex}
      />
    </div>
  );
}

export default TripOptions;
