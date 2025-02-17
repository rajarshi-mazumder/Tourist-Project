require('dotenv').config();
const axios = require("axios");

// 🛫 **Fetch Flight Options (Skyscanner API)**
async function getFlightOptions(from, to) {
  try {
    const response = await axios.get(`https://partners.api.skyscanner.net/apiservices/browseroutes/v1.0/US/USD/en-US/${from}-sky/${to}-sky/2025-06-15`, {
      headers: { "X-API-Key": process.env.SKYSCANNER_API_KEY }
    });

    return response.data.Routes.map(route => ({
      method: "Flight",
      duration: "Varies",
      cost_range: `From $${route.Price}`,
      booking_link: `https://www.skyscanner.com/flights/${from}/${to}`,
      image_url: "https://example.com/flight_image.jpg"
    }));
  } catch (error) {
    console.error("❌ Error fetching flights:", error);
    return [];
  }
}

// 🚆 **Fetch Train Options (Google Maps API)**
async function getTrainOptions(from, to) {
  try {
    const response = await axios.get(
      // `https://maps.googleapis.com/maps/api/directions/json`,
      `https://maps.googleapis.com/maps/api/directions/json?destination=${to}&origin=${from}&mode=transit&transit_mode=train&departure_time=now&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    );
    const legs=response.data.routes[0].legs;
    console.log(legs)
    legs[0].steps.forEach((m)=>{
      console.log("STEP", JSON.stringify(m.distance))
    })

   if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      console.warn("⚠️ No transit routes found.");
      return [];
    }

    const transportationOptions = response.data.routes.flatMap((route) =>
      route.legs.flatMap((leg) =>
        leg.steps
          .filter((step) => step.travel_mode === "TRANSIT")
          .map((step) => {
            let cost = "Unknown"; // Default if no cost found

            // Extract fare estimate (if available)
            if (response.data.fare) {
              cost = `${response.data.fare.currency} ${response.data.fare.value}`;
            } else if (step.transit_details.line.agencies?.[0]?.url.includes("redbus")) {
              cost = "Check RedBus site for pricing";
            } else if (step.transit_details.line.agencies?.[0]?.url.includes("japanrailpass")) {
              cost = "Check Japan Rail Pass for pricing";
            }

            return {
              method: step.transit_details.line.vehicle.name || "Transit",
              operator: step.transit_details.line.agencies?.[0]?.name || "Unknown Operator",
              departure_time: step.transit_details.departure_time.text || "Unknown Time",
              arrival_time: step.transit_details.arrival_time.text || "Unknown Time",
              duration: step.duration.text || "Unknown Duration",
              cost_range: cost,
              booking_link: step.transit_details.line.agencies?.[0]?.url || "No Booking Link"
            };
          })
      )
    );

    console.log("✅ Transportation options extracted:", transportationOptions);
    return transportationOptions;
  } catch (error) {
    console.error("❌ Error fetching transportation options:", error);
    return [];
  }
}


// 🚌 **Fetch Bus Options (Willer Express API or Google Maps)**
async function getBusOptions(from, to) {
  return [{
    method: "Bus",
    duration: "Varies",
    cost_range: "$10 - $50 USD",
    booking_link: "https://www.willerexpress.com/",
    image_url: "https://example.com/bus_image.jpg"
  }];
}

// 🚗 **Fetch Car Rental Options (RentalCars API)**
async function getCarRentalOptions(from, to) {
  return [{
    method: "Rental Car",
    duration: "Flexible",
    cost_range: "$40 - $100 per day",
    booking_link: "https://www.rentalcars.com/",
    image_url: "https://example.com/rental_car.jpg"
  }];
}

// 📌 **Main Function to Get Transport Options**
async function getTransportOptions(from, to) {
//   const flights = await getFlightOptions(from, to);
  const trains = await getTrainOptions(from, to);
//   const buses = await getBusOptions(from, to);
//   const cars = await getCarRentalOptions(from, to);

  // Select the **Top 5 Best Options**
//   return [...flights, ...trains, ...buses, ...cars].slice(0, 5);
  return [ ...trains];
}

module.exports = { getTransportOptions };
