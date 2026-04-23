import AsyncStorage from "@react-native-async-storage/async-storage";

let activities = [];

// Load activities
export const loadActivities = async () => {
  try {
    const saved = await AsyncStorage.getItem("activities");
    activities = saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.log("Error loading activities:", e);
  }
  return activities;
};

// -----------------------------
// 🔥 TSS CALCULATIONS
// -----------------------------

// RUNNING TSS (tempo-based)
export const calculateRunTSS = (durationMin, distanceKm, thresholdPaceSec) => {
  if (!durationMin || !distanceKm || !thresholdPaceSec) return 0;

  const paceSec = (durationMin * 60) / distanceKm;
  const IF = thresholdPaceSec / paceSec;

  const tss = durationMin * IF * IF;
  return Math.round(tss);
};

// WALKING TSS (simple intensity model)
export const calculateWalkTSS = (durationMin, distanceKm) => {
  if (!durationMin || !distanceKm) return 0;

  const speed = distanceKm / (durationMin / 60); // km/h

  let IF = 0.3;
  if (speed > 5) IF = 0.4;
  if (speed > 6) IF = 0.5;

  const tss = durationMin * IF;
  return Math.round(tss);
};

// CYCLING TSS (speed-based, bez wattmetru)
export const calculateBikeTSS = (durationMin, distanceKm) => {
  if (!durationMin || !distanceKm) return 0;

  const speed = distanceKm / (durationMin / 60); // km/h

  let IF = 0.5;
  if (speed > 20) IF = 0.7;
  if (speed > 25) IF = 0.9;
  if (speed > 30) IF = 1.1;

  const tss = durationMin * IF * IF;
  return Math.round(tss);
};

// -----------------------------
// 🔥 RUNNING POWER (realistic model)
// -----------------------------
export const calculateRunningPower = (durationMin, distanceKm, weightKg = 70) => {
  if (!durationMin || !distanceKm) return 0;

  const timeSec = durationMin * 60;
  const distanceM = distanceKm * 1000;

  const v = distanceM / timeSec; // m/s

  // Realistický model podle Garmin/Stryd
  const power = weightKg * (1.04 + 0.29 * v * v);

  return Math.round(power);
};

// AUTO SELECT TSS
export const calculateTSS = (activity, ftp, thresholdPaceSec = 300) => {
  const { type, duration, distanceKm } = activity;

  if (type === "Running") {
    return calculateRunTSS(duration, distanceKm, thresholdPaceSec);
  }

  if (type === "Walking") {
    return calculateWalkTSS(duration, distanceKm);
  }

  if (type === "Cycling") {
    return calculateBikeTSS(duration, distanceKm);
  }

  return 0;
};

// -----------------------------
// 🔥 SAVE ACTIVITY (WITH TSS + RUNNING POWER)
// -----------------------------
export const saveActivity = async (activity, ftp, thresholdPaceSec = 300) => {
  const tss = calculateTSS(activity, ftp, thresholdPaceSec);

  const runningPower =
    activity.type === "Running"
      ? calculateRunningPower(
          activity.duration,
          activity.distanceKm,
          activity.weight || 70
        )
      : 0;

  activities.push({
    ...activity,
    tss,
    runningPower,
  });

  try {
    await AsyncStorage.setItem("activities", JSON.stringify(activities));
  } catch (e) {
    console.log("Error saving activity:", e);
  }
};

// Clear all activities
export const clearActivities = async () => {
  try {
    activities = [];
    await AsyncStorage.removeItem("activities");
  } catch (e) {
    console.log("Error clearing activities:", e);
  }
};

// Totals by type
export const getTotals = () => {
  const totals = {
    Running: 0,
    Walking: 0,
    Cycling: 0,
  };

  activities.forEach((a) => {
    if (totals[a.type] !== undefined) {
      totals[a.type] += a.distanceKm || 0;
    }
  });

  return totals;
};

// -----------------------------
// 🔥 Running Ability Index (RAI)
// -----------------------------
export const getRunningAbilityIndex = (daysWindow = 30) => {
  if (!activities || activities.length === 0) return 0;

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - daysWindow);

  const runs = activities.filter((a) => {
    if (a.type !== "Running" || !a.date) return false;
    const d = new Date(a.date);
    return d >= fromDate && d <= now;
  });

  if (runs.length === 0) return 0;

  let totalSeconds = 0;
  let totalKm = 0;

  runs.forEach((r) => {
    if (!r.duration || !r.distanceKm) return;
    totalSeconds += r.duration * 60;
    totalKm += r.distanceKm;
  });

  if (totalKm === 0 || totalSeconds === 0) return 0;

  const paceSecPerKm = totalSeconds / totalKm;
  const rai = 1000 / paceSecPerKm;

  return Math.round(rai * 100) / 100;
};

// RAI HISTORY (last 30 days)
export const getRaiHistory = (days = 30) => {
  const history = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);

    const dayStr = day.toISOString().split("T")[0];

    const runs = activities.filter(
      (a) => a.type === "Running" && a.date && a.date.startsWith(dayStr)
    );

    if (runs.length === 0) {
      history.unshift({ date: dayStr, rai: 0 });
      continue;
    }

    let totalSec = 0;
    let totalKm = 0;

    runs.forEach((r) => {
      totalSec += r.duration * 60;
      totalKm += r.distanceKm;
    });

    const pace = totalSec / totalKm;
    const rai = 1000 / pace;

    history.unshift({
      date: dayStr,
      rai: Math.round(rai * 100) / 100,
    });
  }

  return history;
};

// -----------------------------
// 🔥 DAILY TSS (SUM OF ALL ACTIVITIES TODAY)
// -----------------------------
export const getTodayTSS = () => {
  const today = new Date().toISOString().split("T")[0];

  let total = 0;

  activities.forEach((a) => {
    if (!a.date) return;
    if (a.date.startsWith(today)) {
      total += a.tss || 0;
    }
  });

  return Math.round(total);
};

// Get all activities
export const getActivities = () => activities;

