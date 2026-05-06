import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="stats" options={{ title: "Stats" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: 24 + insets.bottom }]}
    >
      <BlurView intensity={70} tint="dark" style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.selectionAsync();
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              style={styles.item}
            >
              <Ionicons
                name={getIcon(route.name)}
                size={22}
                color={isFocused ? "#0b5b59" : "#9CA3AF"}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {getLabel(route.name)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

function getIcon(name: string) {
  switch (name) {
    case "index":
      return "home";
    case "stats":
      return "bar-chart";
    case "saved":
      return "bookmark";
    case "profile":
      return "person";
    default:
      return "ellipse";
  }
}

function getLabel(name: string) {
  switch (name) {
    case "index":
      return "Home";
    case "stats":
      return "Stats";
    case "saved":
      return "Saved";
    case "profile":
      return "Profile";
    default:
      return "";
  }
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "center",
  },
  container: {
    height: 64,
    width: "100%",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor:
      Platform.OS === "android" ? "rgba(28,38,38,0.96)" : undefined,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 30,
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Manrope-SemiBold",
  },
  labelActive: {
    color: "#0b5b59",
    fontFamily: "Manrope-Bold",
  },
});
