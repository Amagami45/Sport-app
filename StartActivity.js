import React, { useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, Stylesheet} from 'react-native';
import * as Location from "expo-location";
import {saveActivity, getTotals} from "./ActivityStore"

const kcalPerKm = {
    Running: 60,
    Walking: 40,
    Cycling: 30,
};

//main
export default function StartActivity({onFinish}) {
    const units = "km";
    const defaultType = "Running"

    const [type, setType] = useState(defaultType);
    const [tracking, setTracking] = useState(false);
    const [coords, setCoords] = useState([]);
    const [distance, setDistance] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [region, setRegion] = useState(null);

    const [totals,setTotals] = useState({
        Running:0,
        Walking:0,
        Cycling:0,
    });

    const formatDistance = (km) =>{
        units === "mi" ? km / 1.60934 : km;
    };

    const loadTotals = () => {
        setTotals(getTotals());
    };

    useEffect(() => {
        setTotals(getTotals());
    }, []);


    const startTracking = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("GPS permission denied");
      return;
    }

    setCoords([]);
    setDistance(0);
    setElapsed(0);
    setRegion(null);

    setTracking(true);
    setStartTime(Date.now());
  };

  const stopTracking = () => {
    if (coords.length < 2) {
      alert("Not enough GPS data yet");
      return;
    }

    const durationMin = Math.round(elapsed / 60);
    const dKm = distance;
    const kcal = Math.round(dKm * kcalPerKm[type]);

    const activity = {
      id: Date.now().toString(),
      type,
      duration: durationMin,
      distanceKm: dKm,
      distanceText: formatDistance(dKm).toFixed(2) + " " + units,
      kcal,
      date: new Date().toLocaleString(),
      gps: coords,
    };

    saveActivity(activity);
    loadTotals();

    setTracking(false);
    onFinish(activity);
  };

  useEffect(() => {
    let sub;

    if (tracking) {
      sub = Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 5 },
        (loc) => {
          setCoords((prev) => {
            if (prev.length === 0) {
              setRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }

            if (prev.length > 0) {
              const last = prev[prev.length - 1];
              const dist = getDistance(last, loc.coords);
              setDistance((d) => d + dist);
            }

            return [...prev, loc.coords];
          });
        }
      );
    }

    return () => {
      if (sub) sub.then((s) => s.remove());
    };
  }, [tracking]);

  useEffect(() => {
    let interval;
    if (tracking) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tracking, startTime]);

  const getDistance = (p1, p2) => {
    const R = 6371;
    const dLat = ((p2.latitude - p1.latitude) * Math.PI) / 180;
    const dLon = ((p2.longitude - p1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(p1.latitude * (Math.PI / 180)) *
        Math.cos(p2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Start Activity</Text>

      {!tracking && (
        <>
          <Text style={styles.label}>Choose sport:</Text>

          <View style={styles.row}>
            {["Running", "Walking", "Cycling"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeButton,
                  type === t && styles.typeButtonActive,
                ]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === t && styles.typeTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total {type} distance:</Text>
            <Text style={styles.totalValue}>
              {formatDistance(totals[type]).toFixed(2)} {units}
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={startTracking}>
            <Text style={styles.startText}>Start Tracking</Text>
          </TouchableOpacity>
        </>
      )}

      {tracking && (
        <>
          <Text style={styles.stat}>
            Distance: {formatDistance(distance).toFixed(2)} {units}
          </Text>
          <Text style={styles.stat}>Time: {formatTime(elapsed)}</Text>

          <View style={styles.mapPlaceholder}>
            <Text style={{ color: "#aaa" }}>
              Map preview not available in Snack
            </Text>
          </View>

          <TouchableOpacity style={styles.stopBtn} onPress={stopTracking}>
            <Text style={styles.stopText}>Stop</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

//Styles
const styles=Stylesheet.create({
    continer:{
        flex:1,
        backgroundColor:"#18191D",
        padding: 20,
    },
    header:{
        fontSize:26,
        color:"white",
        textAlign:"center",
        marginBottom:20,
    },
    label:{
        color:"#aaa",
        marginBottom:10,
    },
    row:{
        flexDirection: "row",
        justifyContent: "space-between",
    },
    typeButton:{
        flex:1,
        padding:12,
        backgroundColor:"#2E3035",
        borderRadius:10,
        maginHorizontal:4,
    },
    typeButtonActive:{
        backgroundColor:"#9EE26A",
    },
    typeText:{
        color:"white",
        textAlign:"center",
    },
    typeTextActive:{
        color:"#0B1307",
        fontWeight:"700",
    },
    startBtn:{
        marginTop:30,
        backgroundColor:"#9EE26A",
        padding:16,
        borderRadius:12,
    },
    startText:{
        color:"0B1307",
        textAlign:"center",
        fontSize:"700",
    },
    stat:{
        color:"white",
        fontSize:18,
        marginTop:20,
    },
    stopBtn:{
        marginTop:40,
        backgroundColor:"#FF5252",
        padding:16,
        borderRadius:12,
    },
    stopText:{
        color:"white",
        textAlign:"center",
        fontWeight:"700",
    },
});
