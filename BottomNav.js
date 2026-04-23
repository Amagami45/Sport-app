import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

const theme = {
  colors: {
    surface: "#18191D",
    primary: "#9EE26A",
    onPrimary: "#0B1307",
    onSurface: "#E3E3E3",
    onSurfaceVariant: "#A0A3AA",
  },
};

// Icon renderer
const IconRenderer = ({ icon, size, color }) => {
  if (typeof icon === "string") {
    return <MaterialIcons name={icon} size={size} color={color} />;
  }
  if (icon.type === "material") {
    return <MaterialIcons name={icon.name} size={size} color={color} />;
  }
  return (
    <MaterialCommunityIcons name={icon.name} size={size} color={color} />
  );
};

// Nav items
const navItems = [
  {
    key: "Sportoverview",
    label: "Home",
    icon: { type: "material", name: "home" },
  },
  {
    key: "Activity",
    label: "Activity",
    icon: { type: "material", name: "directions-bike" },
  },
  {
    key: "Settings",
    label: "Settings",
    icon: { type: "material", name: "settings" },
  },
];

export default function BottomNav({ active, onChange }) {
  return (
    <View style={styles.bottomNav}>
      {navItems.map((item) => {
        const isActive = item.key === active;
        const color = isActive
          ? theme.colors.onPrimary
          : theme.colors.onSurfaceVariant;
        const bg = isActive ? theme.colors.primary : "transparent";

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.bottomNavItem}
            onPress={() => onChange(item.key)}
            activeOpacity={0.85}
          >
            <View
              style={[styles.bottomNavIconWrapper, { backgroundColor: bg }]}
            >
              <IconRenderer icon={item.icon} size={26} color={color} />
            </View>

            <Text
              style={[
                styles.bottomNavLabel,
                {
                  color: isActive
                    ? theme.colors.onSurface
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
