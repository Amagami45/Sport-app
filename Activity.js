import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Activity({
  onStartActivity,
  onNewActivity,
  onActivityHistory,
  metrics = [],
}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Activity</Text>

        {/* START ACTIVITY (GPS) */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onStartActivity}
        >
          <MaterialIcons name="play-circle-outline" size={26} color="#0B1307" />
          <Text style={styles.primaryButtonText}>Start Activity</Text>
        </TouchableOpacity>

        {/* NEW ACTIVITY (ruční zadání) */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNewActivity}
        >
          <MaterialIcons name="add-circle-outline" size={22} color="#0B1307" />
          <Text style={styles.primaryButtonText}>New Activity</Text>
        </TouchableOpacity>

        {/* ACTIVITY HISTORY */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onActivityHistory}
        >
          <MaterialIcons name="history" size={22} color="#E3E3E3" />
          <Text style={styles.secondaryButtonText}>Activity History</Text>
        </TouchableOpacity>

        {/* zbytek Activity obsahu */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#18191D" },
  scroll: { padding: 16, paddingBottom: 120 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E3E3E3",
    marginBottom: 16,
    textAlign: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9EE26A",
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#0B1307",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E3035",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: "#E3E3E3",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
