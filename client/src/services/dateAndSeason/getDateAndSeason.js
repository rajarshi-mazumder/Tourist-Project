import axios from "axios";

const getDateAndSeason = () => {
  const now = new Date();
  const month = now.toLocaleString("en-US", { month: "long" }); // e.g., "March"
  const monthNumber = now.getMonth() + 1;

  let season = "";

  if ([3, 4, 5].includes(monthNumber)) {
    season = "Spring"; // 春 (Haru) - Cherry blossoms, pleasant weather
  } else if ([6, 7, 8].includes(monthNumber)) {
    season = "Summer"; // 夏 (Natsu) - Rainy season in June, hot and humid in July/August
  } else if ([9, 10, 11].includes(monthNumber)) {
    season = "Autumn"; // 秋 (Aki) - Autumn leaves, cooler weather
  } else {
    season = "Winter"; // 冬 (Fuyu) - Snow in northern regions, cold weather
  }

  return { month, season };
};

const getWeather = async (location) => {
  // const apiKey = process.env.WEATHERAPI_KEY;
  const apiKey = "c9af7e5eb6664f5eb5555801250103";

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(
    location
  )}&days=10&aqi=no&alerts=no`;

  try {
    const response = await axios.get(url);
    const dailyForecast = response.data.forecast.forecastday.map((day) => {
      return {
        date: day.date,
        temp_min: day.day.mintemp_c,
        temp_max: day.day.maxtemp_c,
        weather: day.day.condition.text,
        icon: `https:${day.day.condition.icon}`,
      };
    });

    return dailyForecast;
  } catch (error) {
    console.error(
      "Error fetching weather forecast from WeatherAPI:",
      error.response?.data || error.message
    );
    throw new Error("Failed to fetch weather forecast");
  }
};

const getMonthSeasonWeather = async (location) => {
  const { month, season } = getDateAndSeason();
  const dailyForecast = await getWeather(location);

  return {
    month,
    season,
    dailyForecast,
  };
};

export { getMonthSeasonWeather };
