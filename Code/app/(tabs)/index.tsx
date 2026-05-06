// HomeScreen.jsx
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { type ComponentProps } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.profileRow}>
          <View>
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              style={styles.avatar}
            />
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>Alex</Text>
          </View>
        </View>
        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={20} color="#9CA3AF" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Headline */}
        <View style={styles.section}>
          <Text style={styles.title}>
            Master your{"\n"}
            <Text style={styles.highlight}>professional voice</Text>
          </Text>

          {/* Weekly Goal */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <MaterialIcons name="psychology" size={20} color="#0b5b59" />
                <Text style={styles.cardTitle}>Weekly Goal</Text>
              </View>
              <Text style={styles.badge}>3/5 Sessions</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text style={styles.muted}>You&apos;re on a 3-day streak! Keep it up.</Text>
          </View>
        </View>

        {/* Practice Scenarios */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Practice Scenarios</Text>
            <Text style={styles.link}>View all</Text>
          </View>
          <View style={styles.grid}>
            {cards.map((c) => {
              const isCareerFair = c.title === "Career Fairs";

              return (
                <TouchableOpacity
                  key={c.title}
                  activeOpacity={isCareerFair ? 0.85 : 1}
                  onPress={
                    isCareerFair ? () => router.push("/career-fair") : undefined
                  }
                  style={styles.gridCard}
                >
                  <View style={styles.rowBetween}>
                    <View style={[styles.iconWrap, { backgroundColor: c.bg }]}>
                      <Ionicons name={c.icon} size={22} color={c.color} />
                    </View>
                    <Text style={[styles.level, { color: c.levelColor }]}>
                      {c.level}
                    </Text>
                  </View>

                  <Text style={styles.gridTitle}>{c.title}</Text>
                  <Text style={styles.gridDesc}>{c.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type IoniconName = ComponentProps<typeof Ionicons>["name"];

type PracticeCard = {
  title: string;
  desc: string;
  icon: IoniconName;
  bg: string;
  color: string;
  level: string;
  levelColor: string;
};

const cards: PracticeCard[] = [
  {
    title: "Career Fairs",
    desc: "Master the art of first impressions and booth etiquette.",
    icon: "hand-left-outline",
    bg: "#DBEAFE",
    color: "#2563EB",
    level: "BEGINNER",
    levelColor: "#16A34A",
  },
  {
    title: "Job Interviews",
    desc: "Tackle tough behavioral questions with STAR method.",
    icon: "mic-outline",
    bg: "#EDE9FE",
    color: "#7C3AED",
    level: "ADVANCED",
    levelColor: "#DC2626",
  },
  {
    title: "Networking",
    desc: "Small talk strategies and finding common ground.",
    icon: "chatbubble-ellipses-outline",
    bg: "#FFEDD5",
    color: "#EA580C",
    level: "MEDIUM",
    levelColor: "#D97706",
  },
  {
    title: "Public Speaking",
    desc: "Voice modulation and handling stage fright.",
    icon: "podium-outline",
    bg: "#CCFBF1",
    color: "#0D9488",
    level: "ADVANCED",
    levelColor: "#DC2626",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191c1f",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  profileRow: { flexDirection: "row", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#191c1f",
  },
  welcome: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Manrope",
  },
  name: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Manrope-Bold",
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#23272b",
    alignItems: "center",
    justifyContent: "center",
  },
  section: { paddingHorizontal: 24, marginBottom: 24 },
  title: {
    fontSize: 32,
    fontFamily: "Manrope-ExtraBold",
    color: "#fff",
    lineHeight: 36,
  },
  highlight: { color: "#0b5b59" },
  card: {
    backgroundColor: "#23272b",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontFamily: "Manrope-SemiBold",
    marginLeft: 6,
  },
  badge: {
    fontSize: 12,
    color: "#0b5b59",
    backgroundColor: "rgba(11,91,89,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontFamily: "Manrope-Bold",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    marginTop: 12,
  },
  progressFill: {
    width: "60%",
    height: 6,
    backgroundColor: "#0b5b59",
    borderRadius: 3,
  },
  muted: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 10,
  },
  hero: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1c2626",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { padding: 20 },
  inProgress: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fbbf24",
    marginRight: 6,
  },
  inProgressText: {
    fontSize: 10,
    color: "#fff",
    fontFamily: "Manrope-Bold",
  },
  step: { fontSize: 12, color: "#D1D5DB" },
  heroTitle: {
    fontSize: 20,
    color: "#fff",
    fontFamily: "Manrope-Bold",
    marginTop: 14,
  },
  heroDesc: {
    fontSize: 13,
    color: "#D1D5DB",
    marginTop: 6,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b5b59",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  ctaText: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Manrope-Bold",
  },
  link: {
    color: "#0b5b59",
    fontFamily: "Manrope-SemiBold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  gridCard: {
    width: "47%",
    backgroundColor: "#23272b",
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    padding: 10,
    borderRadius: 10,
  },
  level: {
    fontSize: 10,
    fontFamily: "Manrope-Bold",
  },
  gridTitle: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    marginTop: 10,
  },
  gridDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  community: {
    marginTop: 24,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  communityTitle: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
  },
  communityDesc: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  communityBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  communityBtnText: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    fontSize: 12,
  },
  bottomNav: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: "rgba(35,39,43,0.95)",
    borderRadius: 32,
    height: 64,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 10, color: "#9CA3AF" },
  navActive: { color: "#0b5b59", fontFamily: "Manrope-Bold" },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#374151",
  },
});
