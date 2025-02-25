const axios = require("axios");
const { searchPlacesAndGetDetails } = require("../../maps/mapsController");

async function getHotels(location, keyword) {
  try {
    const applicationId = process.env.RAKUTEN_APP_ID;
    const encodedCityName = encodeURIComponent(location);
    const encodedKeywords = encodeURIComponent(keyword);
    const baseUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?applicationId=${applicationId}&format=json&keyword=${encodedCityName}%20${encodedKeywords}%20en`;
    console.log(`API URL: ${baseUrl}`);

    const hotelResponse = await axios.get(baseUrl);

    const hotels =
      hotelResponse.data?.hotels?.map((hotel) => {
        const hotelInfo = hotel.hotel[0].hotelBasicInfo;
        return {
          hotelName: hotelInfo.hotelName,
          hotelInformationUrl: hotelInfo.hotelInformationUrl,
          hotelImageUrl: hotelInfo.hotelImageUrl,
          hotelThumbnailUrl: hotelInfo.hotelThumbnailUrl,
          address1: hotelInfo.address1,
          address2: hotelInfo.address2,
          telephoneNo: hotelInfo.telephoneNo,
          access: hotelInfo.access,
          hotelMinCharge: hotelInfo.hotelMinCharge,
          reviewCount: hotelInfo.reviewCount,
          reviewAverage: hotelInfo.reviewAverage,
        };
      }) || [];

    return hotels;
  } catch (error) {
    // console.error("🚨 Error fetching hotels:", error.message);
    throw error;
  }
}

async function getHotelsFromRakutenAPI(req, res) {
  const { location, keyword } = req.body;
  try {
    const hotels = await getHotels(keyword, location);
    res.status(200).json(hotels);
  } catch (error) {
    console.error("🚨 Error in getHotelsFromMaps:", error);
    res.status(500).json({ message: error.message });
  }
}

async function getHotelsFromMaps(req, res) {
  try {
    const { keyword, location } = req.body;
    const result = await searchPlacesAndGetDetails(keyword, location);
    return res.json(result);
  } catch (error) {
    console.error("Error in searchPlacesAndDetailsHandler:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getHotels, getHotelsFromMaps, getHotelsFromRakutenAPI };
