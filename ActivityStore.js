import AsyncStorage from "@react-native-async-storage/async-storage";

export let activities = [];

// Load activities (SINGLE SOURCE OF TRUTH)
export const loadActivities = async () => {
  try {
    const saved = await AsyncStorage.getItem("activities");
    activities = saved ? JSON.parse(saved) : [];
    return activities;
  } catch (e) {
    console.log("Error loading activities:", e);
    return [];
  }
};

// RUNNING TSS
export const calculateRunTSS = (durationMin, distanceKm, thresholdPaceSec) => {
  if (!durationMin || !distanceKm || !thresholdPaceSec) return 0;

  const paceSec = (durationMin * 60) / distanceKm;
  const IF = thresholdPaceSec / paceSec;

  return Math.round(durationMin * IF * IF);
};

// WALKING TSS
export const calculateWalkTSS = (durationMin, distanceKm) => {
  if (!durationMin || !distanceKm) return 0;

  const speed = distanceKm / (durationMin / 60);

  let IF = 0.3;
  if (speed > 5) IF = 0.4;
  if (speed > 6) IF = 0.5;

  return Math.round(durationMin * IF);
};

// CYCLING TSS
export const calculateBikeTSS = (durationMin, distanceKm) => {
  if (!durationMin || !distanceKm) return 0;

  const speed = distanceKm / (durationMin / 60);

  let IF = 0.5;
  if (speed > 20) IF = 0.7;
  if (speed > 25) IF = 0.9;
  if (speed > 30) IF = 1.1;

  return Math.round(durationMin * IF * IF);
};

// RUNNING POWER
export const calculateRunningPower = (durationMin, distanceKm, weightKg = 70) => {
  if (!durationMin || !distanceKm) return 0;

  const timeSec = durationMin * 60;
  const distanceM = distanceKm * 1000;
  const v = distanceM / timeSec;

  return Math.round(weightKg * (1.04 + 0.29 * v * v));
};

// AUTO SELECT TSS
export const calculateTSS = (activity, ftp, thresholdPaceSec = 300) => {
  const { type, duration, distanceKm } = activity;

  if (type === "Running") return calculateRunTSS(duration, distanceKm, thresholdPaceSec);
  if (type === "Walking") return calculateWalkTSS(duration, distanceKm);
  if (type === "Cycling") return calculateBikeTSS(duration, distanceKm);

  return 0;
};

// SAVE ACTIVITY
export const saveActivity = async (activity, ftp, thresholdPaceSec = 300) => {
  const tss = calculateTSS(activity, ftp, thresholdPaceSec);

  const runningPower =
    activity.type === "Running"
      ? calculateRunningPower(activity.duration, activity.distanceKm, activity.weight || 70)
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

// CLEAR ALL
export const clearActivities = async () => {
  try {
    activities = [];
    await AsyncStorage.removeItem("activities");
  } catch (e) {
    console.log("Error clearing activities:", e);
  }
};

// TOTALS
export const getTotals = () => {
  const totals = { Running: 0, Walking: 0, Cycling: 0 };

  activities.forEach((a) => {
    if (totals[a.type] !== undefined) totals[a.type] += a.distanceKm || 0;
  });

  return totals;
};

// RAI (single value)
export const getRunningAbilityIndex = (daysWindow = 30) => {
  if (!activities.length) return 0;

  const now = new Date();
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - daysWindow);

  const runs = activities.filter((a) => {
    if (a.type !== "Running" || !a.date) return false;
    const d = new Date(a.date);
    return d >= fromDate && d <= now;
  });

  if (!runs.length) return 0;

  let totalSeconds = 0;
  let totalKm = 0;

  runs.forEach((r) => {
    totalSeconds += r.duration * 60;
    totalKm += r.distanceKm;
  });

  if (!totalKm || !totalSeconds) return 0;

  const paceSecPerKm = totalSeconds / totalKm;
  const rai = 1000 / paceSecPerKm;

  return Math.round(rai * 100) / 100;
};

// RAI HISTORY (30 days)
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

    if (!runs.length) {
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

// TODAY TSS
export const getTodayTSS = () => {
  const today = new Date().toISOString().split("T")[0];

  let total = 0;

  activities.forEach((a) => {
    if (a.date?.startsWith(today)) total += a.tss || 0;
  });

  return Math.round(total);
};

// TODAY ACTIVE MINUTES
export const getTodayActiveMinutes = () => {
  const today = new Date().toISOString().split("T")[0];

  let total = 0;

  activities.forEach((a) => {
    if (a.date?.startsWith(today)) total += a.duration || 0;
  });

  return total;
};

// GET ALL
export const getActivities = () => activities;
