import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [units, setUnits] = useState("km");
  const [defaultType, setDefaultType] = useState("Running");
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [weight, setWeight] = useState(70);
  const [ftp, setFtp] = useState(250);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedUnits = await AsyncStorage.getItem("units");
        const storedDefaultType = await AsyncStorage.getItem("defaultType");
        const storedGps = await AsyncStorage.getItem("gpsEnabled");
        const storedWeight = await AsyncStorage.getItem("weight");
        const storedFtp = await AsyncStorage.getItem("ftp");

        if (storedUnits) setUnits(storedUnits);
        if (storedDefaultType) setDefaultType(storedDefaultType);
        if (storedGps !== null) setGpsEnabled(storedGps === "true");
        if (storedWeight !== null) setWeight(Number(storedWeight));
        if (storedFtp !== null) setFtp(Number(storedFtp));

      } catch (e) {
        console.log("Error loading settings", e);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("units", units);
  }, [units]);

  useEffect(() => {
    AsyncStorage.setItem("defaultType", defaultType);
  }, [defaultType]);

  useEffect(() => {
    AsyncStorage.setItem("gpsEnabled", String(gpsEnabled));
  }, [gpsEnabled]);

  useEffect(() => {
    AsyncStorage.setItem("weight", String(weight));
  }, [weight]);

  useEffect(() => {
    AsyncStorage.setItem("ftp", String(ftp));
  }, [ftp]);

  useEffect(() => {
    const convertWeight = async () => {
      try {
        const storedWeight = await AsyncStorage.getItem("weight");
        if (!storedWeight) return;

        const w = Number(storedWeight);

        if (units === "mi" && w < 200) {
          const lbs = Math.round(w * 2.20462);
          setWeight(lbs);
          await AsyncStorage.setItem("weight", String(lbs));
        }

        if (units === "km" && w > 200) {
          const kg = Math.round(w * 0.453592);
          setWeight(kg);
          await AsyncStorage.setItem("weight", String(kg));
        }

      } catch (e) {
        console.log("Error converting weight", e);
      }
    };

    convertWeight();
  }, [units]);

  const resetSettings = async () => {
    try {
      await AsyncStorage.multiRemove([
        "units",
        "defaultType",
        "gpsEnabled",
        "weight",
        "ftp",
      ]);

      setUnits("km");
      setDefaultType("Running");
      setGpsEnabled(true);
      setWeight(70);
      setFtp(250); 

    } catch (e) {
      console.log("Error resetting settings", e);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        units,
        setUnits,
        defaultType,
        setDefaultType,
        gpsEnabled,
        setGpsEnabled,
        weight,
        setWeight,
        ftp,        
        setFtp,     
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);