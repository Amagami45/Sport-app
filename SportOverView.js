import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSettings } from "./SettingsContext";

import {
  loadActivities,
  getTodayActiveMinutes,
  getRunningAbilityIndex,
  getRaiHistory,
  getTodayTSS,
} from "./ActivityStore";

import RaiChart from "./RaiChart";
import TSSChart from "./TssChart";
import Svg, { Polyline, Circle } from "react-native-svg";

function RunningPowerChart({ data }) {
  if (!data || data.length === 0) return null;

  const width = 300;
  const height = 120;
  const maxPower = Math.max(...data.map((d) => d.runningPower), 1);

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.runningPower / maxPower) * height;
    return `${x},${y}`;
  });

  return (
    <View style={{ alignItems: "center", marginTop: 10 }}>
      <Text style={{ color: "white", marginBottom: 6 }}>
        Running Power – last 30 days
      </Text>

      <Svg width={width} height={height}>
        <Polyline
          points={points.join(" ")}
          fill="none"
          stroke="#FFD54F"
          strokeWidth="3"
        />

        {points.map((p, i) => {
          const [x, y] = p.split(",").map(Number);
          return <Circle key={i} cx={x} cy={y} r="3" fill="#FFD54F" />;
        })}
      </Svg>
    </View>
  );
}

// THEME
const theme = {
  colors: {
    background: "#18191D",
    surface: "#222327",
    surfaceVariant: "#2E3035",
    surfaceContainer: "#2A2C31",
    primary: "#9EE26A",
    onPrimary: "#0B1307",
    onSurface: "#E3E3E3",
    onSurfaceVariant: "#A0A3AA",
    success: "#4CAF50",
    error: "#FF5252",
  },
};

// PROGRESS BAR
function ProgressBar({ value, color, width, max }) {
  const percent = Math.min(value / max, 1);
  return (
    <View style={[styles.progressBackground, { width }]}>
      <View
        style={[
          styles.progressFill,
          { width: width * percent, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// PROGRESS RING
function Ring({ size, stroke, progress, color }) {
  const half = size / 2;
  const rotation = (progress / 100) * 360;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: half,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: stroke,
          borderColor: "#333",
        }}
      />
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: half,
          borderWidth: stroke,
          borderColor: color,
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          transform: [{ rotateZ: `${rotation}deg` }],
        }}
      />
    </View>
  );
}

// ICON RENDERER
const IconRenderer = ({ icon, size = 20, color }) => {
  if (icon.type === "material") {
    return <MaterialIcons name={icon.name} size={size} color={color} />;
  }
  return (
    <MaterialCommunityIcons name={icon.name} size={size} color={color} />
  );
};

// METRIC CARD
const MetricCard = ({ item, onPressCard, onPressInfo, onPressValue }) => {
  const toneColor =
    item.tone === "positive"
      ? theme.colors.success
      : item.tone === "negative"
      ? theme.colors.error
      : theme.colors.onSurfaceVariant;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPressCard}
      style={{ flex: 1 }}
    >
      <View style={styles.metricCard}>
        <View style={styles.metricHeaderRow}>
          <View style={styles.metricIconContainer}>
            <IconRenderer icon={item.icon} size={20} color="#E3E3E3" />
          </View>

          {(item.id === "RAI" ||
            item.id === "Runningpower" ||
            item.id === "TSS") && (
            <TouchableOpacity onPress={onPressInfo}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.metricTitle}>{item.title}</Text>

        <TouchableOpacity activeOpacity={0.7} onPress={onPressValue}>
          <Text style={[styles.metricValue, { color: toneColor }]}>
            {item.value}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// SECTION HEADER
const SectionHeader = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// MAIN
export default function SportOverview() {
  const [steps, setSteps] = useState(0);
  const [kcal, setKcal] = useState(0);
  const [activeMinutes, setActiveMinutes] = useState(0);

  const [viewMode, setViewMode] = useState("today");

  const [totalSteps, setTotalSteps] = useState(0);
  const [totalKcal, setTotalKcal] = useState(0);
  const [totalActive, setTotalActive] = useState(0);

  const [raiHistory, setRaiHistory] = useState([]);
  const [showRaiInfo, setShowRaiInfo] = useState(false);
  const [showRaiChart, setShowRaiChart] = useState(false);

  const [showRunningPowerInfo, setShowRunningPowerInfo] = useState(false);
  const [showRunningPowerChart, setShowRunningPowerChart] = useState(false);
  const [showTssInfo, setShowTssInfo] = useState(false);
  const [showTssChart, setShowTssChart] = useState(false);
  const [tssHistory, setTssHistory] = useState([]);


  const [metricItems, setMetricItems] = useState([
    {
      id: "Last activity",
      title: "Last activity",
      value: "—",
      icon: { type: "material-community", name: "walk" },
    },
    {
      id: "FTP",
      title: "FTP",
      value: "—",
      icon: { type: "material-community", name: "bike-pedal" },
      tone: "positive",
    },
    {
      id: "TSS",
      title: "TSS",
      value: "—",
      icon: { type: "material-community", name: "chart-line" },
      tone: "positive",
    },
    {
      id: "RAI",
      title: "RAI",
      value: "—",
      icon: { type: "material-community", name: "run" },
      tone: "positive",
    },
    {
      id: "Runningpower",
      title: "Running power",
      value: "—",
      icon: { type: "material-community", name: "lightning-bolt" },
      tone: "positive",
    },
  ]);

  const { weight, ftp } = useSettings();
  const today = new Date().toLocaleDateString();

  const getToday = () => new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadTotals = async () => {
      setTotalSteps(Number(await AsyncStorage.getItem("total_steps")) || 0);
      setTotalKcal(Number(await AsyncStorage.getItem("total_kcal")) || 0);
      setTotalActive(
        Number(await AsyncStorage.getItem("total_active_minutes")) || 0
      );
    };
    loadTotals();
  }, []);

  useEffect(() => {
    const loadSteps = async () => {
      const savedSteps = await AsyncStorage.getItem("steps");
      const savedDate = await AsyncStorage.getItem("steps_date");
      const today = getToday();

      if (savedDate !== today) {
        setSteps(0);
        await AsyncStorage.setItem("steps", "0");
        await AsyncStorage.setItem("steps_date", today);
      } else if (savedSteps !== null) {
        setSteps(Number(savedSteps));
      }
    };

    loadSteps();

    const interval = setInterval(() => {
      setSteps((s) => s + Math.floor(Math.random() * 5));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("steps", String(steps));
    AsyncStorage.setItem("steps_date", getToday());
  }, [steps]);

  useEffect(() => {
    const burned = Math.round(steps * (0.0005 * weight));
    setKcal(burned);
  }, [steps, weight]);

  useEffect(() => {
    const load = async () => {
      await loadActivities();
      const minutes = getTodayActiveMinutes();
      setActiveMinutes(minutes);
    };

    load();
  }, [steps]);

  useEffect(() => {
    const loadLastActivity = async () => {
      const activities = await loadActivities();
      if (!activities || activities.length === 0) return;

      const last = activities[activities.length - 1];

      const distance = last.distanceKm
        ? last.distanceKm.toFixed(2) + " km"
        : "—";

      const duration = last.duration ? `${last.duration} min` : "—";

      const text = `${distance} • ${duration}`;

      setMetricItems((items) =>
        items.map((item) =>
          item.id === "Last activity" ? { ...item, value: text } : item
        )
      );
    };

    loadLastActivity();
  }, []);

  useEffect(() => {
    const loadRAI = async () => {
      await loadActivities();
      const rai = getRunningAbilityIndex(30);

      setMetricItems((items) =>
        items.map((item) =>
          item.id === "RAI"
            ? { ...item, value: rai > 0 ? `${rai}` : "—" }
            : item
        )
      );
    };

    loadRAI();
  }, []);


  useEffect(() => {
    const loadHistory = async () => {
      await loadActivities();
      const hist = getRaiHistory(30);
      setRaiHistory(hist);
    };
    loadHistory();
  }, []);

  useEffect(() => {
  const loadTssHistory = async () => {
    const activities = await loadActivities();
    if (!activities) return;

    const hist = activities
      .filter(a => a.tss != null)
      .slice(-30)
      .map(a => ({
        date: a.date,
        tss: a.tss,
      }));

    setTssHistory(hist);
  };

  loadTssHistory();
}, []);


  useEffect(() => {
    setMetricItems((items) =>
      items.map((item) =>
        item.id === "FTP"
          ? { ...item, value: ftp > 0 ? `${ftp} W` : "—" }
          : item
      )
    );
  }, [ftp]);

  useEffect(() => {
    const loadPower = async () => {
      const activities = await loadActivities();
      if (!activities || activities.length === 0) return;

      const last = activities[activities.length - 1];

      setMetricItems((items) =>
        items.map((item) =>
          item.id === "Runningpower"
            ? {
                ...item,
                value:
                  last.runningPower > 0 ? `${last.runningPower} W` : "—",
              }
            : item
        )
      );
    };

    loadPower();
  }, []);

  useEffect(() => {
    const loadDailyTSS = async () => {
      await loadActivities();
      const tss = getTodayTSS();

      setMetricItems((items) =>
        items.map((item) =>
          item.id === "TSS"
            ? { ...item, value: tss > 0 ? `${tss}` : "—" }
            : item
        )
      );
    };

    loadDailyTSS();
  }, []);

<Modal visible={showTssChart} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <ScrollView>
        <TSSChart data={tssHistory} />
      </ScrollView>

      <TouchableOpacity
        onPress={() => setShowTssChart(false)}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

  useEffect(() => {
    const updateTotalsIfNewDay = async () => {
      const today = getToday();
      const savedDate = await AsyncStorage.getItem("total_date");

      if (savedDate !== today) {
        const totalSteps =
          Number(await AsyncStorage.getItem("total_steps")) || 0;
        const totalKcal =
          Number(await AsyncStorage.getItem("total_kcal")) || 0;
        const totalActive =
          Number(await AsyncStorage.getItem("total_active_minutes")) ||
          0;

        await AsyncStorage.setItem(
          "total_steps",
          String(totalSteps + steps)
        );
        await AsyncStorage.setItem(
          "total_kcal",
          String(totalKcal + kcal)
        );
        await AsyncStorage.setItem(
          "total_active_minutes",
          String(totalActive + activeMinutes)
        );

        await AsyncStorage.setItem("total_date", today);

        setTotalSteps(totalSteps + steps);
        setTotalKcal(totalKcal + kcal);
        setTotalActive(totalActive + activeMinutes);
      }
    };

    updateTotalsIfNewDay();
  }, [steps, kcal, activeMinutes]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Date: {today}</Text>

        <View style={styles.toggleRow}>
          <Text
            onPress={() =>
              setViewMode(viewMode === "today" ? "total" : "today")
            }
            style={styles.toggleButton}
          >
            {viewMode === "today" ? "Show Total" : "Show Today"}
          </Text>
        </View>

        <View style={styles.topRow}>

          <View style={styles.sideBox}>
            <MaterialCommunityIcons
              name="fire"
              size={22}
              color="#FF7A00"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.sideLabel}>Kcal</Text>
            <Text style={styles.sideValue}>
              {viewMode === "today" ? kcal : totalKcal}
            </Text>
            <ProgressBar
              value={viewMode === "today" ? kcal : totalKcal}
              max={viewMode === "today" ? 400 : 50000}
              color="#FF7A00"
              width={80}
            />
          </View>

          <View style={styles.centerBox}>
            <Ring
              size={160}
              stroke={12}
              progress={66}
              color={theme.colors.primary}
            />
            <Text style={styles.ringValue}>
              {viewMode === "today" ? steps : totalSteps}
            </Text>
            <Text style={styles.ringLabel}>Steps</Text>
          </View>

          <View style={styles.sideBox}>
            <MaterialCommunityIcons
              name="walk"
              size={22}
              color="lime"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.sideLabel}>Activity</Text>
            <Text style={styles.sideValue}>
              {viewMode === "today" ? activeMinutes : totalActive} min
            </Text>
            <ProgressBar
              value={viewMode === "today" ? activeMinutes : totalActive}
              max={viewMode === "today" ? 90 : 5000}
              color="lime"
              width={80}
            />
          </View>
        </View>

        <SectionHeader title="Sport Stats" />

    <FlatList
      data={metricItems}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: 12 }}
      renderItem={({ item }) => (
        <View style={{ flex: 1 }}>
          <MetricCard
            item={item}
            onPressCard={() => {
              if (item.id === "RAI") setShowRaiInfo(true);
              if (item.id === "Runningpower") setShowRunningPowerInfo(true);
              if (item.id === "TSS") setShowTssInfo(true);
        }}
        onPressInfo={() => {
              if (item.id === "RAI") setShowRaiInfo(true);
              if (item.id === "Runningpower") setShowRunningPowerInfo(true);
              if (item.id === "TSS") setShowTssInfo(true);
        }}
        onPressValue={() => {
              if (item.id === "RAI") setShowRaiChart(true);
              if (item.id === "Runningpower") setShowRunningPowerChart(true);
              if (item.id === "TSS") setShowTssChart(true);
              }}
            />
          </View>
        )}
      />

      </ScrollView>

      <Modal visible={showRaiInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.modalTitle}>
                Running Ability Index (RAI)
              </Text>

              <Text style={styles.modalText}>
                The Running Ability Index (RAI) is a simple but highly
                effective indicator of your running performance. It is
                calculated from your running activities over the last 30
                days.
              </Text>

              <Text style={styles.modalSubtitle}>How it works</Text>

              <View style={styles.infoBlock}>
                <Text style={styles.modalText}>
                  • All running activities from the last 30 days are
                  collected.
                </Text>
                <Text style={styles.modalText}>
                  • Total time and total distance are calculated.
                </Text>
                <Text style={styles.modalText}>
                  • Your average pace (sec/km) is determined.
                </Text>
                <Text style={styles.modalText}>
                  • RAI = 1000 / (average pace in sec/km).
                </Text>
              </View>

              <Text style={styles.modalSubtitle}>
                How to read the values
              </Text>

              <View style={styles.infoBlock}>
                <Text style={styles.modalText}>• 0.5 – 1.0 → Beginner</Text>
                <Text style={styles.modalText}>
                  • 1.0 – 1.5 → Slow run / walking
                </Text>
                <Text style={styles.modalText}>
                  • 1.5 – 2.0 → Recreational runner
                </Text>
                <Text style={styles.modalText}>
                  • 2.0 – 2.5 → Regular runner
                </Text>
                <Text style={styles.modalText}>• 2.5 – 3.0 → Advanced</Text>
                <Text style={styles.modalText}>
                  • 3.0 – 3.5 → Very good
                </Text>
                <Text style={styles.modalText}>• 3.5 – 4.0 → Elite</Text>
                <Text style={styles.modalText}>
                  • 4.0+ → World‑class athlete
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRaiInfo(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRaiChart} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <RaiChart data={raiHistory} />
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRaiChart(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRunningPowerInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.modalTitle}>Running Power</Text>

              <Text style={styles.modalText}>
                Running Power represents how much mechanical power (in watts)
                you produce while running. It is similar to cycling power but
                adapted for running biomechanics.
              </Text>

              <Text style={styles.modalSubtitle}>What affects Running Power</Text>
              <Text style={styles.modalText}>• your running speed</Text>
              <Text style={styles.modalText}>• your body weight</Text>
              <Text style={styles.modalText}>• your running efficiency</Text>

              <Text style={styles.modalSubtitle}>Typical values</Text>
              <Text style={styles.modalText}>• 180–240 W → easy run</Text>
              <Text style={styles.modalText}>• 250–320 W → recreational runner</Text>
              <Text style={styles.modalText}>• 330–400 W → fast runner</Text>
              <Text style={styles.modalText}>• 400+ W → very strong runner</Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRunningPowerInfo(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTssInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              <Text style={styles.modalTitle}>Training Stress Score (TSS)</Text>

              <Text style={styles.modalText}>
                TSS is a metric that quantifies the total training load of your
                workout. It combines both duration and intensity into a single
                number.
              </Text>

              <Text style={styles.modalSubtitle}>How to interpret TSS</Text>
              <Text style={styles.modalText}>• 0–50 → light training</Text>
              <Text style={styles.modalText}>• 50–100 → moderate load</Text>
              <Text style={styles.modalText}>• 100–150 → hard training</Text>
              <Text style={styles.modalText}>• 150–200 → very hard</Text>
              <Text style={styles.modalText}>• 200+ → extremely demanding</Text>

              <Text style={styles.modalSubtitle}>Why TSS matters</Text>
              <Text style={styles.modalText}>• helps track fatigue</Text>
              <Text style={styles.modalText}>• helps plan training load</Text>
              <Text style={styles.modalText}>• supports long‑term progress</Text>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowTssInfo(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

<Modal visible={showTssChart} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <ScrollView>
        <TSSChart data={tssHistory} />
      </ScrollView>

      <TouchableOpacity
        onPress={() => setShowTssChart(false)}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

      <Modal visible={showRunningPowerChart} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>

              <RunningPowerChart
                data={raiHistory.map((d) => ({
                  date: d.date,
                  runningPower: 0,
                }))}
              />
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowRunningPowerChart(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  scroll: {
    padding: 16,
    paddingBottom: 120,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 16,
  },

  toggleRow: {
    alignItems: "flex-end",
    marginBottom: 12,
  },

  toggleButton: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  sideBox: {
    alignItems: "center",
    width: 60,
    paddingVertical: 8,
  },

  sideLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 2,
  },

  sideValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 6,
  },

  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    position: "relative",
  },

  ringValue: {
    position: "absolute",
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },

  ringLabel: {
    position: "absolute",
    top: 108,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
  },

  progressBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#333",
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  metricCard: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    minHeight: 120,
    justifyContent: "space-between",
  },

  metricHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },

  metricTitle: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 13,
    marginBottom: 4,
  },

  metricValue: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.onSurface,
  },

  sectionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },

  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingBottom: 20,
    maxHeight: "85%",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 12,
  },

  infoBlock: {
    backgroundColor: "#2E3035",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },

  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },

  modalText: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 6,
    lineHeight: 20,
  },

  closeButton: {
    marginTop: 12,
    alignSelf: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },

  closeButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});