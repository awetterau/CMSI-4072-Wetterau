import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  careerFairSections,
  type CareerFairLesson,
} from "../data/careerFairLessons";

type SectionProps = {
  title: string;
  lessons: CareerFairLesson[];
  dotColor: string;
};

const sectionDotColors: Record<CareerFairLesson["section"], string> = {
  "Before the Fair": "#3B82F6",
  "During the Fair": "#10B981",
  "After the Fair": "#6366F1",
};

export default function CareerFairScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Header - Buttons matched to Home Screen 'Bell' style */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Headline - Single Line matched to Home Screen styling */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Career Fair</Text>
            <Text style={styles.subtitle}>
              Master every stage of the process
            </Text>
          </View>

          {careerFairSections.map((section) => (
            <Section
              key={section.title}
              dotColor={sectionDotColors[section.title as CareerFairLesson["section"]]}
              title={section.title}
              lessons={section.lessons}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Section({ title, lessons, dotColor }: SectionProps) {
  const handleLessonPress = (lesson: CareerFairLesson) => {
    router.push({
      pathname: "/voice-session",
      params: {
        lessonId: lesson.id,
        title: lesson.title,
        tag: lesson.tag,
        duration: lesson.duration,
        level: lesson.level,
      },
    });
  };

  return (
    <View style={styles.roadmapSection}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {lessons.map((l, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleLessonPress(l)}
          >
            <View>
              <View
                style={[styles.tag, { backgroundColor: `${l.tagColor}15` }]}
              >
                <Text style={[styles.tagText, { color: l.tagColor }]}>
                  {l.tag}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{l.title}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{l.duration}</Text>
              <Text style={styles.metaLevel}>{l.level}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191c1f",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#23272b",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Manrope-ExtraBold",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    fontFamily: "Manrope",
    marginTop: 4,
  },
  roadmapSection: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope-Bold",
    color: "#fff",
  },
  seeAll: {
    fontSize: 12,
    color: "#0b5b59",
    fontFamily: "Manrope-SemiBold",
  },
  scrollPadding: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  card: {
    width: 210,
    height: 140,
    backgroundColor: "#23272b",
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    justifyContent: "space-between",
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  tagText: {
    fontSize: 10,
    fontFamily: "Manrope-Bold",
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: "Manrope-Bold",
    color: "#fff",
    marginTop: 10,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Manrope",
  },
  metaLevel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Manrope-Medium",
  },
});
