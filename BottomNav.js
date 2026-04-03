import React from 'react';
import {View, Text, TouchableOpacity, Stylesheet} from 'react-native';
import {MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import {useMaterial3Theme} from "react-native-material-you";

//icon renderer
const iconRenderer = ({icon, size, color}) => {
    if (typeof icon === "string"){
        return <MaterialIcons name={icon} size={size} color={color} />;}
    if (icon.type === "material") {
        return <MaterialIcons name={icon.name} size={size} color={color}/>;}
    return ( 
        <MaterialCommunityIcons name={icon.name} size={size} color={color}/>
    );
    };

// Nav items
const NavItems = [
    {
        key: "Sportoverview",
        label: "Home",
        icon: { type:"material", name:"home" },
    },
    {
        key: "Activity",
        label: "Activity",
        icon: { type:"material", name:"directions-bike"},
    },
    {
        key:"Settings",
        label:"Settings",
        icon: { type:"material", name:"settings"},

    },
]


//bottom navigation
export default function App(){
    const { Theme } = useMaterial3Theme()

    return(
        <View style = {{flex: 1, backgroundColor: theme.color.surface }}>
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
                    onPress={() => onChange(itemKey)}
                    activeOpacity={0.85}
                    >
                        <View style={[styles.bottomNavIconWrapper, {backgroundColor: bg }]}>
                            <iconRenderer icon={item.icon} size={26} color={color} />;
                        </View>

                        <Text
                            style={[
                                styles.bottomNavLabel,
                                {color: isActive ? theme.colors.onSurface : theme.colors.onSurfaceVariant },
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

//Styles
const styles = StyleSheet.create({
    bottomNav: {
        flexdirection: "row",
        justifyContect: "space-around",
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
        justifyContect: "center",
    },
    bottomNavIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContect: "center",
    },
    bottomNavLabel:{
        fontSize: 12,
        marginTop: 4,
    },
});