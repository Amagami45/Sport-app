import React, { useState } from "react";
import { View } from "react-native";

import BottomNav from "./BottomNav";
import Sportoverview from "./Sportoverview";
import Activity from "./Activity";
import Settings from "./Settings";
import NewActivity from "./NewActivity";
import ActivityHistory from "./ActivityHistory";
import StartActivity from "./StartActivity";

import { SettingsProvider } from "./SettingsContext";

export default function App() {
  const [active, setActive] = useState("Sportoverview");
  const [activities, setActivities] = useState([]);

  const addActivity = (activity) => {
    setActivities((prev) => [...prev, activity]);
    setActive("ActivityHistory");
  };

  const renderScreen = () => {
    switch (active) {
      case "Sportoverview":
        return <Sportoverview activities={activities} />;

      case "Activity":
        return (
          <Activity
            onStartActivity={() => setActive("StartActivity")}
            onNewActivity={() => setActive("NewActivity")}
            onActivityHistory={() => setActive("ActivityHistory")}
          />
        );

      case "Settings":
        return <Settings />;

      case "NewActivity":
        return <NewActivity onAddActivity={addActivity} />;

      case "ActivityHistory":
        return <ActivityHistory activities={activities} />;

      case "StartActivity":
        return <StartActivity onFinish={addActivity} />;

      default:
        return <Sportoverview activities={activities} />;
    }
  };

  return (
    <SettingsProvider>
      <View style={{ flex: 1 }}>
        {renderScreen()}
        <BottomNav active={active} onChange={setActive} />
      </View>
    </SettingsProvider>
  );
}