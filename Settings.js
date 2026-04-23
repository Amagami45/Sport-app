import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "./SettingsContext";
import { clearActivities } from "./ActivityStore";

const theme = {
  colors: {
    background: "#18191D",
    surface: "#222327",
    surfaceVariant: "#2E3035",
    onSurface: "#E3E3E3",
    onSurfaceVariant: "#A0A3AA",
    primary: "#9EE26A",
  },
};

export default function Settings() {
  const {
    units,
    setUnits,
    defaultType,
    gpsEnabled,
    setGpsEnabled,
    weight,
    ftp,
    setFtp,
    resetSettings,
  } = useSettings();

  const toggleUnits = () => {
    setUnits(units === "km" ? "mi":"km");
  };

  const cycleDefaultType = () => {
    const order = ["Running", "Walking", "Cycling"];
    const idx = order.indexOf(defaultType);
    setDefaultType(order[(idx + 1) % order.length]);
  };
  const resetAllData = () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset all data?",
      [
        {text:"Cancel", style: "cancel"},
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try{
              await AsyncStorage.multiRemove([
                "steps",
                "steps_date",
                "total_steps",
                "total_kcal",
                "total_active_minutes",
                "total_date",
              ]);

              await clearActivities();
              await resetSettings();

              console.log("All data reset");
            } catch (e) {
              console.log("Error reseting data:", e);
            }
          },
        },
      ]
    );
  };
  return(
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>

          <View className={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="ruler-square"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>Units</Text>
            </View>
            <TouchableOpacity onPress={toggleUnits}>
              <View style={{minWidth: 110, alignItems: "flex-end"}}>
                <Text style={styles.valueText}>
                  {units === "km" ? "Kilometers" : "Miles"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="run"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>Default activity</Text>
            </View>
            <TouchableOpacity onPress={CycleDefaultType}>
              <Text style={styles.valueText}>{defaultType}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.leftRow}>
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>GPS tracking enabled</Text>
            </View>
            <Switch 
            value={gpsEnabled}
            onValueChange={setGpsEnabled}
            thumbColor={theme.colors.primary}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="weight-kilogram"
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.label}>Weight</Text>
            </View>
            <View style={{flexDirection: "row", alignItems:"center", gap: 12}}>
              <TouchableOpacity onPress={() => setWeight((w) => Math.max(30, w - 1 ))}>
                <Text style={styles.valueText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.valueText}>
                {weight} {units === "km" ? "kg":"lbs"}
              </Text>
              <TouchableOpacity onPress={() => setWeight((w) => Math.min(200, w + 1))}>
                <Text style={styles.valueText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={24}
                color={theme.colors.primary}
              />
              <View>
                <Text style={styles.label}>FTP</Text>
                <Text style={styles.subLabel}>Functional Threshold Power</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12}}>
              <TouchableOpacity onPress={() => setFtp((f) => Math.max(100, f - 5))}>
                <Text style={styles.valueText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.valueText}>{ftp} W</Text>

              <TouchableOpacity onPress={() => setFtp((f) => Math.min(500, f + 5))}>
                <Text style={styles.valueText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.row, {marginTop:20}]}>
            <View style={styles.rowLeft}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#FF5252"
              />
              <Text style={[styles.label, {color: "#FF5252"}]}>Reset all data</Text>
            </View>

            <TouchableOpacity onPress={resetAllData}>
              <Text style={[styles.valueText, {color:"#FF5252"}]}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:theme.colors.background,
    padding:16,
    paddingTop:40,
  },
  header:{
    fontSize:24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom:20,
    textAlign:"center",
  },
  section:{
    backgroundColor:theme.colors.surfaceVariant,
    padding:16,
    borderRadius:14,
    marginBottom:20,
  },
  sectionTitle:{
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  subLabel:{
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: -2,
  },
  row:{
    flexDirection:"row",
    justifyContent: "space-between",
    alignItems:"center",
    marginBottom: 18,
  },
  rowLeft:{
    flexDirection: "row",
    alignItems:"center",
    gap:12,
  },
  label:{
    color: theme.colors.onSurface,
    fontSize: 15,
  },
  valueText:{
    color:theme.colors.onSurface,
    fontSize: 15,
    fontWeight:"600",
  },
});