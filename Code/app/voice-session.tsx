import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCareerFairLesson } from "../data/careerFairLessons";
import {
  GeminiEvaluationService,
  type EvaluationResult,
  type HumeVocalMetrics,
} from "../services/GeminiEvaluationService";
import { HumeVoiceService } from "../services/HumeService";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ScoreMetric {
  label: string;
  value: number;
  detail: string;
}

interface SessionResult {
  overall: number;
  headline: string;
  summary: string;
  metrics: ScoreMetric[];
  strengths: string[];
  improvements: string[];
  stats: string[];
  rubricNotes: string[];
  humeVocalSummary: string;
  source: "gemini" | "local";
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const wordCount = (text: string) =>
  text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const buildSessionResult = (
  messages: Message[],
  sessionTime: number,
  volumeSamples: number[],
  lessonTitle: string
): SessionResult => {
  const userMessages = messages.filter((msg) => msg.role === "user");
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");
  const userWords = userMessages.reduce((sum, msg) => sum + wordCount(msg.content), 0);
  const totalWords = messages.reduce((sum, msg) => sum + wordCount(msg.content), 0);
  const averageResponseWords = userMessages.length ? userWords / userMessages.length : 0;
  const turnCount = userMessages.length + assistantMessages.length;
  const durationMinutes = Math.max(sessionTime / 60, 0.25);
  const wordsPerMinute = userWords / durationMinutes;
  const fillerMatches = userMessages
    .map((msg) => msg.content.toLowerCase())
    .join(" ")
    .match(/\b(um|uh|like|you know|basically|literally)\b/g);
  const fillerCount = fillerMatches?.length ?? 0;
  const averageVolume =
    volumeSamples.length > 0
      ? volumeSamples.reduce((sum, sample) => sum + sample, 0) / volumeSamples.length
      : 1;
  const volumeVariance =
    volumeSamples.length > 0
      ? volumeSamples.reduce((sum, sample) => sum + Math.abs(sample - averageVolume), 0) /
        volumeSamples.length
      : 0;

  const substanceScore = clampScore(
    userMessages.length === 0
      ? 0
      : 45 + Math.min(userWords, 140) * 0.25 + Math.min(userMessages.length, 4) * 5
  );
  const clarityScore = clampScore(
    userMessages.length === 0
      ? 0
      : 88 - Math.abs(averageResponseWords - 35) * 0.8 - fillerCount * 5
  );
  const pacingScore = clampScore(
    userMessages.length === 0 ? 0 : 92 - Math.abs(wordsPerMinute - 135) * 0.35
  );
  const vocalScore = clampScore(
    volumeSamples.length === 0
      ? 0
      : 55 + Math.min(Math.max(averageVolume - 1, 0), 0.8) * 45 - volumeVariance * 18
  );
  const engagementScore = clampScore(
    userMessages.length === 0
      ? 0
      : 50 + Math.min(turnCount, 8) * 5 + Math.min(totalWords, 220) * 0.05
  );
  const overall = clampScore(
    substanceScore * 0.3 +
      clarityScore * 0.25 +
      pacingScore * 0.2 +
      vocalScore * 0.15 +
      engagementScore * 0.1
  );

  const headline =
    overall >= 85
      ? "Strong practice round"
      : overall >= 70
        ? "Solid foundation"
        : overall >= 50
          ? "Useful first pass"
          : "Needs more usable data";

  const summary =
    userMessages.length === 0
      ? "End a connected session after answering out loud to generate a complete score."
      : `Your ${lessonTitle.toLowerCase()} was scored from ${userMessages.length} spoken response${
          userMessages.length === 1 ? "" : "s"
        }, ${userWords} user words, and live Hume vocal input levels.`;

  const strengths = [
    userMessages.length >= 2
      ? "You stayed engaged across multiple recruiter turns."
      : "You started the practice flow and reached the result screen.",
    averageResponseWords >= 18
      ? "Your answers had enough length to evaluate substance."
      : "Your shorter answers leave room to become more specific.",
    vocalScore >= 70
      ? "Your vocal signal showed usable energy and presence."
      : "The app captured vocal input and can now score delivery."
  ];

  const improvements = [
    averageResponseWords < 25
      ? "Add one concrete example or outcome to each answer."
      : "Tighten answers around one clear point before adding detail.",
    fillerCount > 1
      ? "Reduce filler words so the pitch sounds more deliberate."
      : "Keep transitions direct and avoid drifting into filler.",
    vocalScore < 70
      ? "Speak a little closer to the mic with steadier volume."
      : "Keep the same energy while varying tone on key points."
  ];

  return {
    overall,
    headline,
    summary,
    metrics: [
      {
        label: "Content",
        value: substanceScore,
        detail: `${userWords} user words across ${userMessages.length} response${
          userMessages.length === 1 ? "" : "s"
        }.`,
      },
      {
        label: "Clarity",
        value: clarityScore,
        detail: `${Math.round(averageResponseWords)} words per answer on average.`,
      },
      {
        label: "Pacing",
        value: pacingScore,
        detail: `${Math.round(wordsPerMinute)} spoken words per minute.`,
      },
      {
        label: "Vocal",
        value: vocalScore,
        detail:
          volumeSamples.length > 0
            ? `${volumeSamples.length} Hume input-volume samples captured.`
            : "No Hume vocal samples were captured.",
      },
      {
        label: "Engagement",
        value: engagementScore,
        detail: `${turnCount} total conversation turns.`,
      },
    ],
    strengths,
    improvements,
    rubricNotes: [
      "This fallback score used the local scoring model because Gemini scoring was unavailable.",
      "Content scoring is based on transcript length, turn count, and response shape.",
      "Vocal scoring is based on Hume input-volume samples.",
    ],
    humeVocalSummary:
      volumeSamples.length > 0
        ? `Hume captured ${volumeSamples.length} input-volume samples during this session.`
        : "Hume did not provide vocal samples for this session.",
    source: "local",
    stats: [
      `Duration ${Math.floor(sessionTime / 60)}:${(sessionTime % 60)
        .toString()
        .padStart(2, "0")}`,
      `${userMessages.length} answers`,
      `${assistantMessages.length} prompts`,
    ],
  };
};

const buildVocalMetrics = (volumeSamples: number[]): HumeVocalMetrics => {
  const averageVolume =
    volumeSamples.length > 0
      ? volumeSamples.reduce((sum, sample) => sum + sample, 0) / volumeSamples.length
      : 1;
  const volumeVariance =
    volumeSamples.length > 0
      ? volumeSamples.reduce((sum, sample) => sum + Math.abs(sample - averageVolume), 0) /
        volumeSamples.length
      : 0;

  return {
    sampleCount: volumeSamples.length,
    averageVolume,
    volumeVariance,
    maxVolume: volumeSamples.length > 0 ? Math.max(...volumeSamples) : 1,
  };
};

const resultFromGemini = (
  evaluation: EvaluationResult,
  sessionTime: number,
  messages: Message[]
): SessionResult => {
  const userMessages = messages.filter((msg) => msg.role === "user");
  const assistantMessages = messages.filter((msg) => msg.role === "assistant");

  return {
    overall: evaluation.overall,
    headline: evaluation.headline,
    summary: evaluation.summary,
    metrics: [
      {
        label: "Content",
        value: evaluation.categories.content,
        detail: "Scored by Gemini against the selected lesson rubric.",
      },
      {
        label: "Clarity",
        value: evaluation.categories.clarity,
        detail: "Scored from the transcript for directness and readability.",
      },
      {
        label: "Relevance",
        value: evaluation.categories.relevance,
        detail: "Scored for fit to the selected Career Fair scenario.",
      },
      {
        label: "Structure",
        value: evaluation.categories.structure,
        detail: "Scored for answer organization and flow.",
      },
      {
        label: "Professionalism",
        value: evaluation.categories.professionalism,
        detail: "Scored for recruiter-appropriate tone and judgment.",
      },
      {
        label: "Vocal",
        value: evaluation.categories.vocalDelivery,
        detail: evaluation.humeVocalSummary,
      },
    ],
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    rubricNotes: evaluation.rubricNotes,
    humeVocalSummary: evaluation.humeVocalSummary,
    source: "gemini",
    stats: [
      `Duration ${Math.floor(sessionTime / 60)}:${(sessionTime % 60)
        .toString()
        .padStart(2, "0")}`,
      `${userMessages.length} answers`,
      `${assistantMessages.length} prompts`,
    ],
  };
};

export default function VoiceSessionScreen() {
  const params = useLocalSearchParams();
  const lesson = getCareerFairLesson(params.lessonId);
  const lessonTitle = lesson.title;

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [aiStatus, setAiStatus] = useState<
    "connecting" | "listening" | "speaking" | "idle" | "error"
  >("connecting");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const volumeAnim = useRef(new Animated.Value(1)).current;

  const humeService = useRef<HumeVoiceService | null>(null);
  const volumeSamples = useRef<number[]>([]);

  /* Timer */
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isConnected && !showResults) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected, showResults]);

  /* Orb pulse */
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  /* Glow when speaking */
  useEffect(() => {
    if (aiStatus === "speaking") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [aiStatus, glowAnim]);

  useEffect(() => {
    let isMounted = true;
    const service = new HumeVoiceService({
      apiKey: process.env.EXPO_PUBLIC_HUME_API_KEY || "",
      configId: process.env.EXPO_PUBLIC_HUME_CONFIG_ID || "",
    });
    humeService.current = service;

    const start = async () => {
      await new Promise((r) => setTimeout(r, 500));
      if (!isMounted) return;

      await service.connect(
        {
          systemPrompt: lesson.humeSystemPrompt,
          variables: {
            lesson_id: lesson.id,
            lesson_title: lesson.title,
            scenario: lesson.scenario,
            opening_prompt: lesson.openingPrompt,
            difficulty: lesson.level,
          },
        },
        (msg) => {
          setMessages((prev) => [...prev, msg]);
        },
        (status, message) => {
          if (!isMounted) return;
          if (status === "connected") {
            setIsConnected(true);
            setConnectionError(null);
            setAiStatus("listening");
            return;
          }
          if (status === "disconnected") {
            setIsConnected(false);
            setAiStatus("idle");
            return;
          }
          if (status === "error") {
            setIsConnected(false);
            setAiStatus("error");
            setConnectionError(message || "Hume connection failed.");
            return;
          }
          setAiStatus(status === "speaking" ? "speaking" : "listening");
        },
        (val) => {
          const sample = Math.max(1, Math.min(2.2, val));
          volumeSamples.current = [...volumeSamples.current.slice(-599), sample];
          Animated.spring(volumeAnim, {
            toValue: sample,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      ).catch((error) => {
        if (!isMounted) return;
        setIsConnected(false);
        setAiStatus("error");
        setConnectionError(
          error instanceof Error ? error.message : "Failed to connect to Hume."
        );
      });
    };
    start();
    return () => {
      isMounted = false;
      service.disconnect();
    };
  }, [lesson, volumeAnim]);

  const toggleMute = () => {
    setIsMuted((m) => !m);
    humeService.current?.setMuted?.(!isMuted);
  };

  const endSession = async () => {
    setShowResults(true);
    setIsScoring(true);
    setScoringError(null);
    humeService.current?.disconnect();

    const samples = volumeSamples.current;
    const fallbackResult = buildSessionResult(messages, sessionTime, samples, lessonTitle);

    try {
      const evaluation = await new GeminiEvaluationService().evaluate({
        lesson,
        messages,
        durationSeconds: sessionTime,
        humeVocalMetrics: buildVocalMetrics(samples),
      });
      setSessionResult(resultFromGemini(evaluation, sessionTime, messages));
    } catch (error) {
      setSessionResult(fallbackResult);
      setScoringError(
        error instanceof Error ? error.message : "Gemini scoring failed."
      );
    } finally {
      setIsScoring(false);
    }
  };

  const closeResults = () => {
    setMessages([]);
    setSessionTime(0);
    setSessionResult(null);
    setIsScoring(false);
    setScoringError(null);
    volumeSamples.current = [];
    setShowResults(false);
    router.back();
  };

  if (showResults) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.container} edges={["top"]}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.resultsEyebrow}>Practice Results</Text>
              <Text style={styles.resultsTitle}>{lessonTitle}</Text>
            </View>
            <TouchableOpacity onPress={closeResults}>
              <Ionicons name="close" size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.resultsContainer}
            contentContainerStyle={styles.resultsContent}
          >
            {isScoring || !sessionResult ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator size="large" color="#0ea5a3" />
                <Text style={styles.loadingTitle}>Scoring with Gemini</Text>
                <Text style={styles.loadingText}>
                  Applying the {lessonTitle} rubric and Hume vocal metrics.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.scoreHero}>
                  <View style={styles.scoreRing}>
                    <Text style={styles.scoreValue}>{sessionResult.overall}</Text>
                    <Text style={styles.scoreLabel}>Score</Text>
                  </View>
                  <View style={styles.scoreSummary}>
                    <View style={styles.sourceRow}>
                      <Text style={styles.sourceText}>
                        {sessionResult.source === "gemini"
                          ? "Gemini 2.5 Flash-Lite"
                          : "Local fallback"}
                      </Text>
                    </View>
                    <Text style={styles.scoreHeadline}>{sessionResult.headline}</Text>
                    <Text style={styles.scoreSummaryText}>{sessionResult.summary}</Text>
                    {scoringError ? (
                      <Text style={styles.scoringError}>
                        Gemini unavailable: local scoring shown.
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.statsRow}>
                  {sessionResult.stats.map((stat) => (
                    <View key={stat} style={styles.statPill}>
                      <Text style={styles.statText}>{stat}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Score Breakdown</Text>
                  {sessionResult.metrics.map((metric) => (
                    <View key={metric.label} style={styles.metricRow}>
                      <View style={styles.metricHeader}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                      </View>
                      <View style={styles.metricTrack}>
                        <View style={[styles.metricFill, { width: `${metric.value}%` }]} />
                      </View>
                      <Text style={styles.metricDetail}>{metric.detail}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Lesson Rubric Notes</Text>
                  {sessionResult.rubricNotes.map((item) => (
                    <View key={item} style={styles.feedbackItem}>
                      <Ionicons name="reader" size={18} color="#38BDF8" />
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Strengths</Text>
                  {sessionResult.strengths.map((item) => (
                    <View key={item} style={styles.feedbackItem}>
                      <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Next Practice Focus</Text>
                  {sessionResult.improvements.map((item) => (
                    <View key={item} style={styles.feedbackItem}>
                      <Ionicons name="arrow-forward-circle" size={18} color="#FBBF24" />
                      <Text style={styles.feedbackText}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>Hume Vocal Summary</Text>
                  <View style={styles.vocalNote}>
                    <Text style={styles.feedbackText}>{sessionResult.humeVocalSummary}</Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.backgroundGlow} />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.personaCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOF3wjdQWBTjOKWsJp4NYjwlefXA86srXX1FT0hL5SXCPUn1lRH6miFBiamAbEbeNyCrstyxStK7azdLTZeYJ0Vufr2s3OhadMnTE50RVu4wTSI8uGBFS6ssZpIMO6wU_OcYRAFs3KIGuBHRvlsZv6Uhb0Fpg-gDzFYsk5mM5jJ2QoaDMDP0cYKrlIBmqOXY7ZQhpXT38GXRS0KjIpHCKe3qSmGS62mCw1v6ga9dG-Y5T8oKFtr7tn4mOsmY6HTGnXC6XIBcq-uzU",
                }}
                style={styles.avatar}
              />
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.personaInfo}>
              <Text style={styles.personaName}>Recruiter Sarah</Text>
              <Text style={styles.personaStatus}>
                {aiStatus === "connecting"
                  ? "CONNECTING..."
                  : aiStatus === "error"
                    ? "CONNECTION FAILED"
                    : aiStatus === "listening"
                      ? "LISTENING..."
                      : "SPEAKING..."}
              </Text>
            </View>
          </View>
          <Text style={styles.lessonTitle}>{lessonTitle}</Text>
          {connectionError ? (
            <Text style={styles.errorText}>{connectionError}</Text>
          ) : null}
        </View>

        <View style={styles.visualizerContainer}>
          <View style={styles.rippleContainer}>
            {/* Outer Ripple */}
            <Animated.View
              style={[
                styles.ripple,
                styles.ripple3,
                {
                  transform: [
                    {
                      scale: Animated.multiply(pulseAnim, volumeAnim),
                    },
                  ],
                },
              ]}
            />
            {/* Middle Ripple */}
            <Animated.View
              style={[
                styles.ripple,
                styles.ripple2,
                {
                  transform: [
                    {
                      scale: Animated.multiply(pulseAnim, volumeAnim),
                    },
                  ],
                },
              ]}
            />
            {/* Inner Ripple */}
            <Animated.View
              style={[
                styles.ripple,
                styles.ripple1,
                {
                  transform: [
                    {
                      scale: Animated.multiply(pulseAnim, volumeAnim),
                    },
                  ],
                },
              ]}
            />
            {/* The Core Orb */}
            <Animated.View
              style={[
                styles.coreOrb,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                  // Make the core orb itself bounce slightly with volume
                  transform: [{ scale: volumeAnim }],
                },
              ]}
            >
              <View style={styles.orbSheen} />
              <MaterialCommunityIcons
                name="waveform"
                size={48}
                color="rgba(255,255,255,0.9)"
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlBar}>
            <TouchableOpacity
              style={styles.muteButton}
              onPress={toggleMute}
              disabled={!isConnected}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={isMuted ? "mic-off" : "mic-off-outline"}
                  size={24}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.endButton} onPress={endSession}>
              <View style={styles.endButtonCircle}>
                <Ionicons name="call" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

/* STYLES UNCHANGED */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191c1f" },
  backgroundGlow: {
    position: "absolute",
    top: "25%",
    left: "50%",
    width: "120%",
    height: "60%",
    backgroundColor: "rgba(11, 91, 89, 0.1)",
    borderRadius: 9999,
    transform: [{ translateX: "-60%" }, { translateY: "-50%" }],
    opacity: 0.6,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  personaCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 44, 49, 0.6)",
    borderRadius: 50,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    backgroundColor: "#10B981",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#282C31",
  },
  personaInfo: { justifyContent: "center" },
  lessonTitle: {
    color: "#D1D5DB",
    fontSize: 13,
    fontFamily: "Manrope-Medium",
    marginTop: 12,
    textAlign: "center",
  },
  errorText: {
    color: "#FCA5A5",
    fontSize: 12,
    fontFamily: "Manrope-Medium",
    lineHeight: 17,
    marginTop: 8,
    paddingHorizontal: 16,
    textAlign: "center",
  },
  personaName: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Manrope-Bold",
    letterSpacing: 0.5,
  },
  personaStatus: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 11,
    fontFamily: "Manrope-Medium",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  visualizerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rippleContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 340,
    height: 340,
  },
  ripple: {
    position: "absolute",
    borderRadius: 9999,
    borderWidth: 1,
  },
  ripple3: {
    width: 340,
    height: 340,
    borderColor: "rgba(11, 91, 89, 0.05)",
    backgroundColor: "rgba(11, 91, 89, 0.05)",
  },
  ripple2: {
    width: 260,
    height: 260,
    borderColor: "rgba(11, 91, 89, 0.1)",
    backgroundColor: "rgba(11, 91, 89, 0.05)",
  },
  ripple1: {
    width: 180,
    height: 180,
    borderColor: "rgba(11, 91, 89, 0.2)",
    backgroundColor: "rgba(11, 91, 89, 0.1)",
  },
  coreOrb: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#0b5b59",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0b5b59",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 60,
    elevation: 10,
  },
  orbSheen: {
    position: "absolute",
    inset: 0,
    borderRadius: 64,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0.5,
  },
  controlsContainer: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  controlBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40, 44, 49, 0.6)",
    borderRadius: 50,
    height: 80,
    paddingHorizontal: 32,
    gap: 32,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  muteButton: { width: 64, alignItems: "center" },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  endButton: { width: 64, alignItems: "center" },
  endButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E76F51",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E76F51",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  resultsEyebrow: {
    color: "#0ea5a3",
    fontSize: 12,
    fontFamily: "Manrope-Bold",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  resultsTitle: {
    fontSize: 22,
    fontFamily: "Manrope-Bold",
    color: "#fff",
  },
  resultsContainer: { flex: 1 },
  resultsContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  loadingBlock: {
    alignItems: "center",
    backgroundColor: "rgba(40, 44, 49, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  loadingTitle: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    fontSize: 18,
    marginTop: 16,
  },
  loadingText: {
    color: "#9CA3AF",
    fontFamily: "Manrope",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  scoreHero: {
    backgroundColor: "rgba(40, 44, 49, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    marginTop: 8,
    padding: 18,
  },
  scoreRing: {
    alignItems: "center",
    backgroundColor: "rgba(11, 91, 89, 0.28)",
    borderColor: "rgba(52, 211, 153, 0.4)",
    borderRadius: 56,
    borderWidth: 2,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  scoreValue: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    fontSize: 34,
  },
  scoreLabel: {
    color: "#9CA3AF",
    fontFamily: "Manrope-Medium",
    fontSize: 12,
    marginTop: -2,
    textTransform: "uppercase",
  },
  scoreSummary: {
    flex: 1,
    justifyContent: "center",
  },
  sourceRow: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(14, 165, 163, 0.14)",
    borderRadius: 999,
    marginBottom: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sourceText: {
    color: "#5EEAD4",
    fontFamily: "Manrope-Bold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  scoreHeadline: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    fontSize: 20,
    lineHeight: 25,
  },
  scoreSummaryText: {
    color: "#D1D5DB",
    fontFamily: "Manrope",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  scoringError: {
    color: "#FCA5A5",
    fontFamily: "Manrope-Medium",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  statPill: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statText: {
    color: "#D1D5DB",
    fontFamily: "Manrope-Medium",
    fontSize: 12,
  },
  sectionBlock: {
    marginTop: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontFamily: "Manrope-Bold",
    fontSize: 16,
    marginBottom: 12,
  },
  metricRow: {
    backgroundColor: "rgba(35, 39, 43, 0.82)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  metricHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: {
    color: "#F3F4F6",
    fontFamily: "Manrope-Bold",
    fontSize: 14,
  },
  metricValue: {
    color: "#34D399",
    fontFamily: "Manrope-Bold",
    fontSize: 16,
  },
  metricTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    height: 8,
    marginTop: 10,
    overflow: "hidden",
  },
  metricFill: {
    backgroundColor: "#0ea5a3",
    borderRadius: 999,
    height: "100%",
  },
  metricDetail: {
    color: "#9CA3AF",
    fontFamily: "Manrope",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  feedbackItem: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  feedbackText: {
    color: "#D1D5DB",
    flex: 1,
    fontFamily: "Manrope",
    fontSize: 14,
    lineHeight: 20,
  },
  vocalNote: {
    backgroundColor: "rgba(35, 39, 43, 0.82)",
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
});
