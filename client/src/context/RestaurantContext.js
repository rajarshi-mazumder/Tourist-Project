import React, { createContext, useState } from 'react';

export const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);

  return (
    <RestaurantContext.Provider value={{ restaurant, setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};
