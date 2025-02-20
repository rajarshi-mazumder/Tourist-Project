import axios from "axios";
import { fileURLToPath } from "url";
const applicationId = "1022755600173894292"; // From Rakuten API

import fs from "fs";
import path from "path";

async function getHotels(cityName) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const placeDataPath = path.resolve(
      __dirname,
      "../../prompts/JapanPlaceDataCodes.json"
    );
    console.log(`HOTELLS ${placeDataPath} `);

    const placeData = JSON.parse(fs.readFileSync(placeDataPath, "utf-8"));

    let largeClassCode, middleClassCode, smallClassCode, detailClassCode;
    let found = false;

    const largeClass = placeData.areaClasses.largeClasses[0].largeClass;

    for (const middleClassWrapper of largeClass[1].middleClasses) {
      const middleClass = middleClassWrapper.middleClass[0];
      for (const smallClassWrapper of middleClassWrapper.middleClass[1]
        .smallClasses) {
        const smallClass = smallClassWrapper.smallClass[0];
        if (smallClass.smallClassName === cityName) {
          largeClassCode = largeClass[0].largeClassCode;
          middleClassCode = middleClass[0].middleClassCode;
          smallClassCode = smallClass.smallClassCode;

          // Iterate through detail classes to find a valid detailClassCode
          for (const detailClassWrapper of smallClass.detailClasses) {
            const detailClass = detailClassWrapper.detailClass;
            detailClassCode = detailClass.detailClassCode;
            found = true;
            break; // Use the first valid detailClassCode found
          }

          if (found) break;
        }
      }
      if (found) break;
    }

    const baseUrl = `https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426?format=json&largeClassCode=${largeClassCode}&middleClassCode=${middleClassCode}&smallClassCode=${smallClassCode}&detailClassCode=${detailClassCode}&applicationId=${applicationId}`;

    console.log(`API URL: ${baseUrl}`);
    const hotelResponse = await axios.get(baseUrl);
    console.log(`API Response: ${JSON.stringify(hotelResponse.data)}`);
    return hotelResponse.data;
  } catch (error) {
    console.error("🚨 Error fetching hotels:", error.message);
    if (error.response) {
      console.error("🔍 API Error Details:", error.response.data);
    }
    throw error;
  }
}

export { getHotels };
