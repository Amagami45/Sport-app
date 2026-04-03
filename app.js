import React, { useState } from "react";
import { View, Text, StyleSheet} from 'react';
import { Card } from 'react-native-paper';
import BottomNav from "./BottomNav";

// aplication body s naimportovanými částmi
export default function App(){
    const [active, setActive ] = useState('Sportoverview');

    const renderScreen = () => {
        switch(active) {
            case "Sportoverview":
                return <Sportoverview/>;
            case "Activity":
                return <Activity/>;
            case "Settings":
                return <Settings/>;
        }
    };
return (
    <View style={{flex: 1}}>
        {renderScreen()}
    <BottomNav active={active} onChange={setActive} />
    </View>
);
}