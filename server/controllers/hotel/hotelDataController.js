import axios from "axios";
import { fileURLToPath } from "url";
const applicationId = "1022755600173894292"; // From Rakuten API

import fs from "fs";
import path from "path";

async function getHotels(cityName) {
  try {
 
    const baseUrl = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?applicationId=${applicationId}&format=json&keyword=${cityName}`;
    console.log(`API URL: ${baseUrl}`);

    const hotelResponse = await axios.get(baseUrl);
    const hotels = hotelResponse.data?.hotels?.map(hotel => {
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


    return hotels ;

  } catch (error) {
    console.error("🚨 Error fetching hotels:", error.message);
    throw error;
  }
}



export { getHotels };
