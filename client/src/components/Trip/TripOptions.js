import React, { useState } from "react";
import japanPlaces from "../../schemas/japanPlaces.json";

function TripOptions({ setCities }) {
  const [days, setDays] = useState(10);
  const [tripPlans, setTripPlans] = useState([]);
  const [previousCity, setPreviousCity] = useState(null);

  const places1 = japanPlaces.places.slice(41, 52);
  const places2 = japanPlaces.places.slice(53, 72);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filtered = places1.filter((place) =>
      place.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredPlaces(filtered);
  };

  const planTrip = async (city) => {
    const toCity = city;
    const fromCity = previousCity ? previousCity : "tokyo";

    try {
      const response = await fetch("http://localhost:4000/trip/city-plan", {
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


  const handleSelectItem = (place) => {
    setSearchTerm(place);
    setFilteredPlaces([]);
  };

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
        <button onClick={fetchCities}>Start Planning</button>
      </div>
      <div>
        <label>
          Search Places :
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
          />
          {filteredPlaces.length > 0 && (
            <ul>
              {filteredPlaces.map((place) => (
                <li key={place} onClick={() => handleSelectItem(place)}>
                  {place}
                </li>
              ))}
            </ul>
          )}
        </label>
        <button onClick={() => planTrip(searchTerm)}>
          Plan to {searchTerm}
        </button>
      </div>
    </div>
  );
}

export default TripOptions;
