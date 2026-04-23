import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSettings } from "./SettingsContext";
import { saveActivity } from "./ActivityStore";

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

const kcalPerKm = {
  Running: 60,
  Walking: 40,
  Cycling: 30,
};

const kcalPerMile = {
  Running: 96,
  Walking: 64,
  Cycling: 48,
};

export default function NewActivity({ onAddActivity }) {
  const { defaultType, units } = useSettings();

  const [type, setType] = useState(defaultType);
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [kcal, setKcal] = useState("");

  // Auto-calc kcal
  useEffect(() => {
    if (distance && !isNaN(distance)) {
      const d = parseFloat(distance);
      const kcalValue =
        units === "km"
          ? d * kcalPerKm[type]
          : d * kcalPerMile[type];

      setKcal(Math.round(kcalValue).toString());
    }
  }, [distance, type, units]);

  const save = () => {
    if (!duration || !distance || !kcal) {
      Alert.alert("Missing data", "Please fill all fields.");
      return;
    }

    if (isNaN(duration) || isNaN(distance) || isNaN(kcal)) {
      Alert.alert("Invalid input", "All fields must be numbers.");
      return;
    }

    const dur = parseFloat(duration);
    const dist = parseFloat(distance);
    const kc = parseFloat(kcal);

    if (dur <= 0 || dur > 600) {
      Alert.alert("Invalid duration", "Duration must be between 1 and 600 minutes.");
      return;
    }

    const maxDistance = units === "km" ? 200 : 120;
    if (dist <= 0 || dist > maxDistance) {
      Alert.alert(
        "Invalid distance",
        `Distance must be between 0 and ${maxDistance} ${units}.`
      );
      return;
    }

    if (kc <= 0 || kc > 5000) {
      Alert.alert("Invalid calories", "Calories must be between 1 and 5000.");
      return;
    }

    // Convert distance to km
    const distanceKm = units === "km" ? dist : dist * 1.60934;

    // 🔥 FIX: správný formát datumu (YYYY-MM-DD)
    const todayISO = new Date().toISOString().split("T")[0];

    const activity = {
      id: Date.now().toString(),
      type,
      duration: dur,
      distanceKm,
      distanceText: `${dist} ${units}`,
      kcal: kc,
      date: todayISO, // 🔥 opraveno
      gps: null,
    };

    // Save to ActivityStore
    saveActivity(activity);

    // Pass to parent
    onAddActivity(activity);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Activity</Text>

      <View style={styles.typeRow}>
        {["Running", "Walking", "Cycling"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.typeButton,
              type === t && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setType(t)}
          >
            <MaterialCommunityIcons
              name={t === "Running" ? "run" : t === "Walking" ? "walk" : "bike"}
              size={22}
              color={type === t ? "#0B1307" : theme.colors.onSurface}
            />
            <Text
              style={[
                styles.typeText,
                type === t && { color: "#0B1307", fontWeight: "700" },
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        placeholder="Duration (min)"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={styles.input}
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />

      <TextInput
        placeholder={`Distance (${units})`}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={styles.input}
        keyboardType="numeric"
        value={distance}
        onChangeText={setDistance}
      />

      <TextInput
        placeholder="Calories (auto)"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        style={styles.input}
        keyboardType="numeric"
        value={kcal}
        onChangeText={setKcal}
      />

      <TouchableOpacity style={styles.saveButton} onPress={save}>
        <Text style={styles.saveText}>Save Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    textAlign: "center",
    marginBottom: 30,
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  typeButton: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  typeText: {
    color: theme.colors.onSurface,
    marginTop: 4,
    fontSize: 13,
  },
  input: {
    backgroundColor: theme.colors.surfaceVariant,
    color: theme.colors.onSurface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  saveText: {
    color: "#0B1307",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});

