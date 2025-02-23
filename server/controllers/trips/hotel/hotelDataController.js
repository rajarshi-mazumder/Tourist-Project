const axios = require("axios");

async function getHotels(cityName) {
  try {
    const applicationId = process.env.RAKUTEN_APP_ID;
    const baseUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?applicationId=${applicationId}&format=json&keyword=${cityName}`;
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
    console.error("🚨 Error fetching hotels:", error.message);
    throw error;
  }
}

module.exports = { getHotels };
