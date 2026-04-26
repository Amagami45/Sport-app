import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { loadActivities } from "./ActivityStore";

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

export default function ActivityHistory() {
  const [activities, setActivities] = useState([]);

  const getIcon = (type) => {
    switch (type) {
      case "Running":
        return "run";
      case "Walking":
        return "walk";
      case "Cycling":
        return "bike";
      default:
        return "run";
    }
  };

  useEffect(() => {
    const load = async () => {
      const data = await loadActivities();
      setActivities(data.reverse());
    };
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity History</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {activities.length === 0 && (
          <Text
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            No activities yet.
          </Text>
        )}

        {activities.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={getIcon(item.type)}
                size={28}
                color={theme.colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.stats}>{item.duration} min</Text>
              <Text style={styles.stats}>{item.distanceText}</Text>
              <Text style={styles.kcal}>{item.kcal} kcal</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  type: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
    marginTop: 2,
  },
  stats: {
    color: theme.colors.onSurface,
    fontSize: 13,
  },
  kcal: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
});
