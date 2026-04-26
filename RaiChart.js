import React from "react";
import { View, Text } from "react-native";
import Svg, {Polyline, Circle} from "react-native-svg";

export default function RaiChart({ data }) {
    if (!data || data.length === 0) return null;

    const width = 300;
    const height = 120;
    const maxRai = Math.max(...data.map((d) => d.rai), 1);

    const points = data.map((d, i) =>{
        const x = (i/(data.length - 1)) * width;
        const y = height - (d.rai/ maxRai) * height;
        return `${x},${y}`;
    });

    return (
        <View style={{alignItems:"center", marginTop: 10}}>
            <Text style={{color: "white",marginBottom:6 }}>
                RAI - Last 30 days
            </Text>

            <Svg width={width} height={height}>
                <Polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke="#9EE26A"
                    strokeWidth="3"
                />

                {points.map((p, i) => {
                    const [x,y] = p.split(",").map(Number);
                    return(
                        <Circle key={i} cx={x} cy={y} r="3" fill="#9EE26A"/>
                    );
                })}
            </Svg>
        </View>
    );
}