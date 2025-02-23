import React, { createContext, useState, useEffect, useContext } from "react";

const CityImageContext = createContext();

export const CityImageProvider = ({ children }) => {
  const [cityImages, setCityImages] = useState({});

  return (
    <CityImageContext.Provider value={{ cityImages, setCityImages }}>
      {children}
    </CityImageContext.Provider>
  );
};

export const useCityImage = () => useContext(CityImageContext);
