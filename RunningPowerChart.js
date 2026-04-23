import React from "react-native";
import { View, Text } from "react-native";
import Svg, {Polyline, Circle} from "react-native-svg";

export default function RunningPowerChart({ data }) {
    if (!data || data.length === 0) return null;

    const width= 300;
    const height= 120;

    const maxPower = Math.max(...data.map((d) => d.runningPower), 1);

    const points = data.map((d, i) => {
        const x = (i/(data.length - 1)) * width;
        const y = height - (d.runningPower/ maxPower) * height;
        return `${x},${y}`;
    });

    return (
        <View style={{ alignItems: "center", marginTop: 10}}>
            <Text style={{ color:"white", marginBottom: 6}}>
                Running Power - last 30 days
            </Text>

            <Svg width={width} height={height}>
                <Polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke="#FFD54F"
                    strokeWidth="3"
                />

                {points.map((p,i) => {
                    const[x,y]=p.split(",").map(Number);
                    return <Circle key={i} cx={x} cy={y} r="3" fill="#FFD54F"/>;
                })}
            </Svg>
        </View>
    );
}