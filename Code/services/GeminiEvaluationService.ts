import type { CareerFairLesson, ScoreCategoryKey } from "@/data/careerFairLessons";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type HumeVocalMetrics = {
  sampleCount: number;
  averageVolume: number;
  volumeVariance: number;
  maxVolume: number;
};

export type EvaluationInput = {
  lesson: CareerFairLesson;
  messages: ConversationMessage[];
  durationSeconds: number;
  humeVocalMetrics: HumeVocalMetrics;
};

export type EvaluationResult = {
  overall: number;
  categories: Record<ScoreCategoryKey, number>;
  headline: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  rubricNotes: string[];
  humeVocalSummary: string;
};

const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const scoreKeys: ScoreCategoryKey[] = [
  "content",
  "clarity",
  "relevance",
  "structure",
  "professionalism",
  "vocalDelivery",
];

const clampScore = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const asStringArray = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => typeof item === "string");
  return strings.length ? strings.slice(0, 4) : fallback;
};

const compactTranscript = (messages: ConversationMessage[]) =>
  messages
    .map((msg) => `${msg.role === "user" ? "User" : "Recruiter Sarah"}: ${msg.content}`)
    .join("\n")
    .slice(0, 12000);

const extractJson = (text: string) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini did not return JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1));
};

const buildPrompt = ({ lesson, messages, durationSeconds, humeVocalMetrics }: EvaluationInput) => `
You are scoring a career fair practice session.

Use ONLY the selected lesson and rubric below. Do not score this like a generic interview.
Selected lesson: ${lesson.title}
Scenario: ${lesson.scenario}
Duration target seconds: ${lesson.durationTargetSeconds}
Actual duration seconds: ${durationSeconds}

Rubric:
${scoreKeys.map((key) => `- ${key}: ${lesson.rubric[key]}`).join("\n")}

Expected user behaviors:
${lesson.expectedUserBehaviors.map((item) => `- ${item}`).join("\n")}

Ideal answer traits:
${lesson.idealAnswerTraits.map((item) => `- ${item}`).join("\n")}

Red flags:
${lesson.redFlags.map((item) => `- ${item}`).join("\n")}

Hume vocal metrics:
- sampleCount: ${humeVocalMetrics.sampleCount}
- averageVolume: ${humeVocalMetrics.averageVolume.toFixed(3)}
- volumeVariance: ${humeVocalMetrics.volumeVariance.toFixed(3)}
- maxVolume: ${humeVocalMetrics.maxVolume.toFixed(3)}

Rules:
- Use transcript content for content, clarity, relevance, structure, and professionalism.
- Use the supplied Hume vocal metrics for vocalDelivery.
- Do not invent vocal details that are not in the Hume metrics.
- If transcript or Hume data is thin, score conservatively and explain that.
- Return valid JSON only. No markdown.
- Scores must be integers from 0 to 100.

Return this exact JSON shape:
{
  "overall": 0,
  "categories": {
    "content": 0,
    "clarity": 0,
    "relevance": 0,
    "structure": 0,
    "professionalism": 0,
    "vocalDelivery": 0
  },
  "headline": "short result label",
  "summary": "2 sentence summary specific to this lesson",
  "strengths": ["specific strength", "specific strength", "specific strength"],
  "improvements": ["specific improvement", "specific improvement", "specific improvement"],
  "rubricNotes": ["rubric-specific note", "rubric-specific note", "rubric-specific note"],
  "humeVocalSummary": "summary grounded only in the Hume metrics"
}

Transcript:
${compactTranscript(messages)}
`;

const parseGeminiResult = (raw: unknown, lesson: CareerFairLesson): EvaluationResult => {
  const data = raw as Partial<EvaluationResult>;
  const rawCategories = (data.categories ?? {}) as Partial<Record<ScoreCategoryKey, unknown>>;
  const categories = scoreKeys.reduce(
    (acc, key) => ({ ...acc, [key]: clampScore(rawCategories[key]) }),
    {} as Record<ScoreCategoryKey, number>
  );

  return {
    overall: clampScore(data.overall),
    categories,
    headline: typeof data.headline === "string" ? data.headline : "Practice results",
    summary:
      typeof data.summary === "string"
        ? data.summary
        : `Scored against the ${lesson.title} rubric.`,
    strengths: asStringArray(data.strengths, ["Completed the practice session."]),
    improvements: asStringArray(data.improvements, ["Add more specific detail next time."]),
    rubricNotes: asStringArray(data.rubricNotes, ["Rubric-specific notes were unavailable."]),
    humeVocalSummary:
      typeof data.humeVocalSummary === "string"
        ? data.humeVocalSummary
        : "Hume vocal metrics were limited for this session.",
  };
};

export class GeminiEvaluationService {
  constructor(
    private apiKey =
      process.env.EXPO_PUBLIC_GEMINI_API_KEY ??
      process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY ??
      process.env.GEMINI_API_KEY ??
      ""
  ) {}

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const key = this.apiKey.trim();
    if (!key) {
      throw new Error("Missing Gemini API key.");
    }

    const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini scoring failed: ${response.status} ${errorText}`);
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new Error("Gemini returned an empty response.");
    }

    return parseGeminiResult(extractJson(text), input.lesson);
  }
}
