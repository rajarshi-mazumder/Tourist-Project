import React, { createContext, useState } from 'react';

export const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [places, setPlaces] = useState([]);

  return (
    <RestaurantContext.Provider value={{ restaurant, setRestaurant, places, setPlaces }}>
      {children}
    </RestaurantContext.Provider>
  );
};
