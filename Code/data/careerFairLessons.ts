export type ScoreCategoryKey =
  | "content"
  | "clarity"
  | "relevance"
  | "structure"
  | "professionalism"
  | "vocalDelivery";

export type CareerFairLesson = {
  id: string;
  section: "Before the Fair" | "During the Fair" | "After the Fair";
  tag: string;
  tagColor: string;
  title: string;
  duration: string;
  level: string;
  durationTargetSeconds: number;
  scenario: string;
  openingPrompt: string;
  humeSystemPrompt: string;
  rubric: Record<ScoreCategoryKey, string>;
  expectedUserBehaviors: string[];
  idealAnswerTraits: string[];
  redFlags: string[];
};

const recruiterSarahBase = `You are Recruiter Sarah, a realistic but supportive career fair recruiter. Keep your spoken responses concise and conversational. Ask one question at a time. Let the user finish before responding. Do not provide a final score, rubric, or coaching during the conversation. Stay in character as a recruiter and keep the scenario focused on the selected lesson.`;

export const careerFairLessons: CareerFairLesson[] = [
  {
    id: "elevator-pitch",
    section: "Before the Fair",
    tag: "Strategy",
    tagColor: "#3B82F6",
    title: "30-second Elevator Pitch",
    duration: "2 min",
    level: "Beginner",
    durationTargetSeconds: 120,
    scenario: "The user is meeting a recruiter at a career fair and needs to deliver a concise introduction.",
    openingPrompt: "Hi, I am Sarah. Nice to meet you. Tell me a little about yourself.",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing a 30-second elevator pitch at a career fair.
Start by asking them to introduce themselves as if they just walked up to your booth.
After their pitch, ask one concise follow-up about their target role, skills, or proof of impact.
Evaluation focus after the call: clear identity, target role or interest, relevant skills, specific proof, concise close.`,
    rubric: {
      content: "Includes identity, field or target role, relevant skills, and a specific proof point.",
      clarity: "Easy to follow, direct, and free of rambling or confusing phrasing.",
      relevance: "Connects the pitch to a recruiter at a career fair.",
      structure: "Has a clear opening, middle, and close within a short pitch.",
      professionalism: "Sounds polished, confident, and appropriate for a first recruiter interaction.",
      vocalDelivery: "Uses steady volume, intentional pacing, and confident delivery based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Introduce themselves clearly.",
      "Name their target role or interest.",
      "Give one concrete skill, project, or result.",
      "End with an invitation to continue the conversation.",
    ],
    idealAnswerTraits: [
      "Specific instead of generic.",
      "Brief enough for a busy booth.",
      "Confident without sounding rehearsed.",
    ],
    redFlags: [
      "Only states a major or school with no goal.",
      "Lists too many unrelated interests.",
      "No clear ask or close.",
    ],
  },
  {
    id: "target-company-analysis",
    section: "Before the Fair",
    tag: "Research",
    tagColor: "#A855F7",
    title: "Target Company Analysis",
    duration: "5 min",
    level: "Intermediate",
    durationTargetSeconds: 300,
    scenario: "The user is explaining why they are interested in a specific company at the fair.",
    openingPrompt: "What made you interested in our company today?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing how to discuss a target company at a career fair.
Ask why they are interested in your company. Follow up once about how their background connects to the company.
Evaluation focus after the call: company-specific research, role fit, thoughtful motivation, and practical next step.`,
    rubric: {
      content: "Mentions concrete company details, business area, product, mission, or recent initiative.",
      clarity: "Explains interest in plain language without vague praise.",
      relevance: "Connects the company to the user's role, skills, or goals.",
      structure: "Moves from company insight to personal fit to a focused question or next step.",
      professionalism: "Shows curiosity without flattery or overclaiming.",
      vocalDelivery: "Sounds prepared, composed, and engaged based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Reference at least one company-specific fact.",
      "Connect that fact to their own interests.",
      "Ask a relevant follow-up question.",
    ],
    idealAnswerTraits: [
      "Researched but natural.",
      "Focused on fit.",
      "Curious and specific.",
    ],
    redFlags: [
      "Could apply to any company.",
      "Only talks about prestige or compensation.",
      "No role connection.",
    ],
  },
  {
    id: "resume-talking-points",
    section: "Before the Fair",
    tag: "Prep",
    tagColor: "#6366F1",
    title: "Resume Talking Points",
    duration: "4 min",
    level: "Beginner",
    durationTargetSeconds: 240,
    scenario: "The user is highlighting resume experiences to a recruiter.",
    openingPrompt: "Walk me through one experience on your resume that you are proud of.",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing resume talking points at a career fair.
Ask them to explain one resume item they are proud of. Follow up about their personal contribution and result.
Evaluation focus after the call: ownership, action, measurable outcome, and relevance to a future role.`,
    rubric: {
      content: "Explains the experience, the user's role, actions taken, and outcome.",
      clarity: "Avoids jargon and makes the experience understandable quickly.",
      relevance: "Connects the resume item to a job skill or recruiter interest.",
      structure: "Uses a compact situation-action-result flow.",
      professionalism: "Takes ownership without exaggerating.",
      vocalDelivery: "Uses steady, confident delivery based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Choose one resume item.",
      "Describe their specific contribution.",
      "Mention impact or learning.",
    ],
    idealAnswerTraits: [
      "Concrete action verbs.",
      "Clear outcome.",
      "Relevant skill connection.",
    ],
    redFlags: [
      "Summarizes the whole resume.",
      "Uses vague team language with no ownership.",
      "No result or learning.",
    ],
  },
  {
    id: "asking-about-culture",
    section: "During the Fair",
    tag: "Networking",
    tagColor: "#10B981",
    title: "Asking about Culture",
    duration: "3 min",
    level: "Intermediate",
    durationTargetSeconds: 180,
    scenario: "The user is asking a recruiter thoughtful questions about company culture.",
    openingPrompt: "What would you like to know about the team or culture here?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing how to ask about company culture.
Invite them to ask you about culture. Answer briefly, then ask what kind of environment helps them do their best work.
Evaluation focus after the call: thoughtful questions, professionalism, self-awareness, and conversation flow.`,
    rubric: {
      content: "Asks a thoughtful culture question and explains what environment they value.",
      clarity: "Keeps the question focused and easy to answer.",
      relevance: "Relates culture to work style, team fit, or internship success.",
      structure: "Asks first, listens, then connects with a brief personal preference.",
      professionalism: "Avoids gossip, perks-only framing, or negative assumptions.",
      vocalDelivery: "Sounds curious and conversational based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Ask an open-ended culture question.",
      "Connect culture to how they work.",
      "Stay professional and curious.",
    ],
    idealAnswerTraits: [
      "Open-ended question.",
      "Self-aware follow-up.",
      "Warm tone.",
    ],
    redFlags: [
      "Only asks about perks.",
      "Sounds judgmental.",
      "No personal connection to culture.",
    ],
  },
  {
    id: "handling-tough-questions",
    section: "During the Fair",
    tag: "Impact",
    tagColor: "#F97316",
    title: "Handling Tough Questions",
    duration: "4 min",
    level: "Advanced",
    durationTargetSeconds: 240,
    scenario: "The user is responding to a challenging recruiter question.",
    openingPrompt: "Tell me about a time something did not go as planned. What did you do?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing a tough career fair question.
Ask about a time something did not go as planned. Follow up on accountability, decision-making, and what changed afterward.
Evaluation focus after the call: honesty, ownership, STAR structure, learning, and composure under pressure.`,
    rubric: {
      content: "Provides a real challenge, specific action, result, and lesson learned.",
      clarity: "Explains the situation without becoming defensive or overlong.",
      relevance: "Shows a transferable professional behavior.",
      structure: "Uses a clear STAR or challenge-action-result-learning shape.",
      professionalism: "Takes accountability and avoids blaming others.",
      vocalDelivery: "Stays composed and steady based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Answer with a real example.",
      "Own their role in the situation.",
      "Explain what they learned or changed.",
    ],
    idealAnswerTraits: [
      "Accountable.",
      "Specific.",
      "Calm under pressure.",
    ],
    redFlags: [
      "Blames teammates.",
      "Claims never to have failed.",
      "No learning outcome.",
    ],
  },
  {
    id: "booth-etiquette",
    section: "During the Fair",
    tag: "Presence",
    tagColor: "#22C55E",
    title: "Booth Etiquette",
    duration: "2 min",
    level: "Beginner",
    durationTargetSeconds: 120,
    scenario: "The user is practicing a short, respectful booth interaction.",
    openingPrompt: "Hi, welcome. What brings you by our booth today?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing booth etiquette during a busy career fair.
Greet them and ask what brings them by. Keep the conversation brisk and realistic for a crowded booth.
Evaluation focus after the call: greeting, concise purpose, respectful turn-taking, and clear close.`,
    rubric: {
      content: "States a clear reason for approaching the booth.",
      clarity: "Keeps the interaction concise and easy to respond to.",
      relevance: "Fits a busy career fair booth setting.",
      structure: "Includes greeting, purpose, brief exchange, and close.",
      professionalism: "Respects time and sounds courteous.",
      vocalDelivery: "Uses confident, polite vocal presence based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Greet the recruiter.",
      "State their purpose quickly.",
      "Close politely.",
    ],
    idealAnswerTraits: [
      "Brief.",
      "Polite.",
      "Purposeful.",
    ],
    redFlags: [
      "Monopolizes time.",
      "No clear purpose.",
      "Abrupt ending.",
    ],
  },
  {
    id: "following-up-on-internship",
    section: "After the Fair",
    tag: "Connection",
    tagColor: "#6366F1",
    title: "Following Up on Internship",
    duration: "4 min",
    level: "Advanced",
    durationTargetSeconds: 240,
    scenario: "The user is practicing a follow-up conversation after meeting a recruiter.",
    openingPrompt: "We spoke earlier about internships. What would you like to follow up on?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing following up on an internship conversation after a fair.
Ask what they want to follow up on. Probe for the role, why it fits, and the next step they are requesting.
Evaluation focus after the call: context reminder, internship fit, professional ask, and follow-through.`,
    rubric: {
      content: "Reminds the recruiter of prior context and names the internship interest.",
      clarity: "Makes the follow-up ask clear.",
      relevance: "Connects skills and goals to the internship.",
      structure: "Uses context, fit, and next-step request.",
      professionalism: "Sounds respectful, prepared, and not pushy.",
      vocalDelivery: "Sounds composed and intentional based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Reference the earlier interaction.",
      "Name the internship or team.",
      "Ask for a clear next step.",
    ],
    idealAnswerTraits: [
      "Specific context.",
      "Clear ask.",
      "Professional persistence.",
    ],
    redFlags: [
      "No reminder of context.",
      "Vague interest.",
      "Pushy or entitled tone.",
    ],
  },
  {
    id: "linkedin-request",
    section: "After the Fair",
    tag: "Etiquette",
    tagColor: "#EC4899",
    title: "LinkedIn Request",
    duration: "1 min",
    level: "Beginner",
    durationTargetSeconds: 60,
    scenario: "The user is practicing how to ask for or frame a LinkedIn connection request.",
    openingPrompt: "Before we wrap up, how would you like to stay connected?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing a LinkedIn connection request after a career fair interaction.
Ask how they would like to stay connected. Respond as a recruiter and keep it brief.
Evaluation focus after the call: concise context, polite request, and professional tone.`,
    rubric: {
      content: "Includes who they are, where they met, and why they want to connect.",
      clarity: "Makes the request short and unmistakable.",
      relevance: "Ties the request to the career fair conversation.",
      structure: "Uses context, appreciation, and connection request.",
      professionalism: "Sounds polite and low-pressure.",
      vocalDelivery: "Uses warm, respectful delivery based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Mention the career fair context.",
      "Ask politely to connect.",
      "Keep it short.",
    ],
    idealAnswerTraits: [
      "Brief context.",
      "Specific reason.",
      "Gracious tone.",
    ],
    redFlags: [
      "Generic request.",
      "Too casual.",
      "No context for the recruiter.",
    ],
  },
  {
    id: "thank-you-messages",
    section: "After the Fair",
    tag: "Follow-up",
    tagColor: "#8B5CF6",
    title: "Thank You Messages",
    duration: "2 min",
    level: "Beginner",
    durationTargetSeconds: 120,
    scenario: "The user is practicing a concise thank-you follow-up after a career fair.",
    openingPrompt: "What would you say in a thank-you message after our conversation?",
    humeSystemPrompt: `${recruiterSarahBase}

Scenario: The user is practicing a thank-you message after a career fair conversation.
Ask them what they would say in the message. Follow up once to make the message more specific.
Evaluation focus after the call: gratitude, specific callback, continued interest, and concise next step.`,
    rubric: {
      content: "Includes thanks, a specific conversation callback, interest, and next step.",
      clarity: "Sounds concise and easy to read or say.",
      relevance: "References the actual fair conversation rather than a generic note.",
      structure: "Uses gratitude, callback, fit, and close.",
      professionalism: "Sounds appreciative without overdoing it.",
      vocalDelivery: "Uses clear, steady delivery based on Hume metrics.",
    },
    expectedUserBehaviors: [
      "Thank the recruiter.",
      "Mention one specific detail.",
      "Restate interest or ask a next step.",
    ],
    idealAnswerTraits: [
      "Specific.",
      "Concise.",
      "Warm but professional.",
    ],
    redFlags: [
      "Generic thank-you only.",
      "Too long.",
      "No continued interest or next step.",
    ],
  },
];

export const careerFairSections = ["Before the Fair", "During the Fair", "After the Fair"].map(
  (title) => ({
    title,
    lessons: careerFairLessons.filter((lesson) => lesson.section === title),
  })
);

export const getCareerFairLesson = (id?: string | string[]) => {
  const lessonId = Array.isArray(id) ? id[0] : id;
  return (
    careerFairLessons.find((lesson) => lesson.id === lessonId) ??
    careerFairLessons.find((lesson) => lesson.id === "elevator-pitch") ??
    careerFairLessons[0]
  );
};
