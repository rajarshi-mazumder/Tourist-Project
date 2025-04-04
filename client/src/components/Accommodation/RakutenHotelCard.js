import React from "react";
import { BOOKING_COM_URL } from "../../constants";

function RakutenHotelCard({
  accommodation,
  city,
  fetchHotelPrice,
  hotelPrices,
}) {
  const hotelName = accommodation.hotelName;
  const priceData = hotelPrices[hotelName];

  return (
    <div className="carousel-card">
      <h3>{accommodation.hotelName}
      {priceData ? (
        priceData.error ? (
          <p>{priceData.error}</p>
        ) : (
          <p>
            Price: {priceData.price_per_night} {priceData.currency}
          </p>
        )
      ) : (
        <button onClick={() => fetchHotelPrice(hotelName, city)}>
          Show Price
        </button>
      )}
      </h3>
      <img
        src={accommodation.hotelImageUrl}
        alt={accommodation.hotelName}
        style={{ width: "100%", height: "200px", objectFit: "cover" }}
      />
      <p>Name: {accommodation.hotelName}</p>
      <a
        href={`${BOOKING_COM_URL}${accommodation.hotelName}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        More Information
      </a>
      <p>
        Address: {accommodation.address1}, {accommodation.address2}
      </p>
      <p>Telephone: {accommodation.telephoneNo}</p>
      <p>Access: {accommodation.access}</p>
      <p>Min Charge: {accommodation.hotelMinCharge}</p>
      <p>
        Reviews: {accommodation.reviewCount} ({accommodation.reviewAverage})
      </p>
    </div>
  );
}

export default RakutenHotelCard;
