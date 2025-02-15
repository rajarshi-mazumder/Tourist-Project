import logo from "./logo.svg";
import "./App.css";
import TripForm from "./components/TripForm";
import TripDisplay from "./components/TripDisplay";
import { useState } from "react";

function App() {
  const [tripData, setTripData] = useState(null);

  return (
    <div className="App">
      <TripForm setTripData={setTripData} />
      <TripDisplay tripData={tripData} />
    </div>
  );
}

export default App;
