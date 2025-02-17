import axios from "axios";

const TRANSPORT_APIS = {
  trains: "https://api.example.com/trains",
  flights: "https://api.example.com/flights",
  buses: "https://api.example.com/buses",
  ferries: "https://api.example.com/ferries",
  subways: "https://api.example.com/subways",
};

async function getTrainOptions(from, to) {
  try {
    const response = await axios.get(
      `${TRANSPORT_APIS.trains}?from=${from}&to=${to}`
    );
    return response.data.map((train) => ({
      method: "Train",
      from: train.departure,
      to: train.arrival,
      duration: train.duration,
      cost_range: train.price_range,
      booking_link: train.booking_url,
      image_url: train.image_url || "https://example.com/train.jpg",
    }));
  } catch (error) {
    console.error("Error fetching train options:", error);
    return [];
  }
}

async function getFlightOptions(from, to) {
  try {
    const response = await axios.get(
      `${TRANSPORT_APIS.flights}?from=${from}&to=${to}`
    );
    return response.data.map((flight) => ({
      method: "Flight",
      from: flight.departure_airport,
      to: flight.arrival_airport,
      duration: flight.duration,
      cost_range: flight.price_range,
      booking_link: flight.booking_url,
      image_url: flight.image_url || "https://example.com/flight.jpg",
    }));
  } catch (error) {
    console.error("Error fetching flight options:", error);
    return [];
  }
}

async function getBusOptions(from, to) {
  try {
    const response = await axios.get(
      `${TRANSPORT_APIS.buses}?from=${from}&to=${to}`
    );
    return response.data.map((bus) => ({
      method: "Bus",
      from: bus.departure_station,
      to: bus.arrival_station,
      duration: bus.duration,
      cost_range: bus.price_range,
      booking_link: bus.booking_url,
      image_url: bus.image_url || "https://example.com/bus.jpg",
    }));
  } catch (error) {
    console.error("Error fetching bus options:", error);
    return [];
  }
}

async function getFerryOptions(from, to) {
  try {
    const response = await axios.get(
      `${TRANSPORT_APIS.ferries}?from=${from}&to=${to}`
    );
    return response.data.map((ferry) => ({
      method: "Ferry",
      from: ferry.departure_port,
      to: ferry.arrival_port,
      duration: ferry.duration,
      cost_range: ferry.price_range,
      booking_link: ferry.booking_url,
      image_url: ferry.image_url || "https://example.com/ferry.jpg",
    }));
  } catch (error) {
    console.error("Error fetching ferry options:", error);
    return [];
  }
}

async function getSubwayOptions(from, to) {
  try {
    const response = await axios.get(
      `${TRANSPORT_APIS.subways}?from=${from}&to=${to}`
    );
    return response.data.map((subway) => ({
      method: "Subway",
      from: subway.departure_station,
      to: subway.arrival_station,
      duration: subway.duration,
      cost_range: subway.price_range,
      booking_link: subway.booking_url,
      image_url: subway.image_url || "https://example.com/subway.jpg",
    }));
  } catch (error) {
    console.error("Error fetching subway options:", error);
    return [];
  }
}

export {
  getTrainOptions,
  getFlightOptions,
  getBusOptions,
  getFerryOptions,
  getSubwayOptions,
};
