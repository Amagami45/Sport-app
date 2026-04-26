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
    const saveData = async () => {
      try {
        await AsyncStorage.setItem("units", units);
        await AsyncStorage.setItem("defaultType", defaultType);
        await AsyncStorage.setItem("gpsEnabled", String(gpsEnabled));
        await AsyncStorage.setItem("weight", String(weight));
        await AsyncStorage.setItem("ftp", String(ftp));
      } catch (e) {
        console.log("Error uploading to internal storage:", e);
      }
    };
    saveData();
  }, [units, defaultType, gpsEnabled, weight, ftp]);

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
export default SettingsContext;
