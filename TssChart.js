import React from "react";
import { View, Text } from "react-native";
import Svg, { Polyline, Circle } from "react-native-svg";

export default function TSSChart({ data }){
    if( !data || data.length === 0) return null;

    const width = 300;
    const height = 120;

    const maxTss = Math.max(...data.map((d) => d.tss), 1);

    const points = data.map((d, i) => {
        const x = (i / (data.lenght - 1)) * width;
        const y = height - (d.tss / maxTss) * height;
        return `${x},${y}`;
    });

    return (
        <View style={{ alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: "white", marginBottom: 6}}>
                TSS - last 30 days
            </Text>

            <Svg width={width} height={height}>
                <Polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke="#4FC3F7"
                    strokeWidth="3"
                />

                {points.map((p, i) => {
                    const [x, y] = p.split(",").map(Number);
                    return <Circle key={i} cx={x} cy={y} r="3" fill="#4FC3F7" />;
                })}
            </Svg> 
        </View>
    );
}