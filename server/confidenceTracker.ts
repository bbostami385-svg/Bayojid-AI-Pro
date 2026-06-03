/**
 * Confidence Assessment & Progress Tracking System
 * Tracks learner confidence and builds self-efficacy
 */

import { invokeLLM } from "./_core/llm";

export interface ConfidenceAssessment {
  id: string;
  userId: number;
  topic: string;
  timestamp: Date;
  preConfidence: number; // 0-100
  postConfidence: number; // 0-100
  selfEfficacy: number; // 0-100
  mastery: number; // 0-100
  feedback: string;
}

export interface ProgressMetrics {
  userId: number;
  topic: string;
  totalLessonsCompleted: number;
  averageScore: number;
  confidenceGrowth: number;
  masteryLevel: "novice" | "beginner" | "intermediate" | "advanced" | "expert";
  estimatedTimeToMastery: number; // hours
  strengths: string[];
  areasForImprovement: string[];
}

export interface LearnerProfile {
  userId: number;
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  pacePreference: "slow" | "moderate" | "fast";
  confidenceLevel: "low" | "medium" | "high";
  motivationType: "intrinsic" | "extrinsic";
  topics: TopicProgress[];
}

export interface TopicProgress {
  topic: string;
  startDate: Date;
  currentLevel: "beginner" | "intermediate" | "advanced";
  completionPercentage: number;
  confidence: number;
  lastActivityDate: Date;
}

/**
 * Assess learner confidence before and after learning
 */
export async function assessConfidence(
  userId: number,
  topic: string,
  stage: "pre" | "post"
): Promise<number> {
  const prompt = `
Generate a confidence assessment for a learner ${stage} ${stage === "pre" ? "starting" : "completing"} learning about "${topic}".

Ask questions to gauge:
1. Knowledge of the topic
2. Ability to solve problems
3. Readiness to teach others
4. Comfort with the material
5. Confidence in real-world application

Respond with a confidence score (0-100) and brief explanation.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Assess learner confidence accurately and supportively.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const match = content?.match(/\d+/);
  return match ? parseInt(match[0]) : 50;
}

/**
 * Calculate self-efficacy score
 */
export async function calculateSelfEfficacy(
  userId: number,
  topic: string,
  completedActivities: string[],
  performanceScores: number[]
): Promise<number> {
  const averageScore = performanceScores.length > 0 ? performanceScores.reduce((a, b) => a + b) / performanceScores.length : 0;

  const prompt = `
Calculate self-efficacy score based on:
- Topic: ${topic}
- Activities Completed: ${completedActivities.length}
- Average Performance: ${averageScore}%
- Activities: ${completedActivities.join(", ")}

Self-efficacy considers:
1. Past successes
2. Mastery experiences
3. Vicarious learning
4. Social persuasion
5. Emotional state

Respond with score (0-100) and reasoning.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Calculate self-efficacy scores based on learning performance.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const match = content?.match(/\d+/);
  return match ? parseInt(match[0]) : 50;
}

/**
 * Generate personalized confidence-building feedback
 */
export async function generateConfidenceFeedback(
  topic: string,
  currentConfidence: number,
  performanceScore: number,
  completedActivities: number
): Promise<ConfidenceFeedback> {
  const prompt = `
Generate personalized, encouraging feedback to build confidence.

Topic: ${topic}
Current Confidence: ${currentConfidence}%
Performance Score: ${performanceScore}%
Activities Completed: ${completedActivities}

Create feedback that:
1. Acknowledges progress
2. Highlights strengths
3. Provides specific praise
4. Offers constructive guidance
5. Builds self-efficacy
6. Motivates continued learning

Respond with JSON:
{
  "encouragement": "encouraging message",
  "strengths": ["strength1"],
  "nextSteps": "specific next steps",
  "affirmation": "personalized affirmation",
  "challenge": "appropriate challenge",
  "resources": "recommended resources"
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate personalized, confidence-building feedback.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return {
    encouragement: parsed.encouragement || "",
    strengths: parsed.strengths || [],
    nextSteps: parsed.nextSteps || "",
    affirmation: parsed.affirmation || "",
    challenge: parsed.challenge || "",
    resources: parsed.resources || "",
  };
}

export interface ConfidenceFeedback {
  encouragement: string;
  strengths: string[];
  nextSteps: string;
  affirmation: string;
  challenge: string;
  resources: string;
}

/**
 * Calculate mastery level
 */
export async function calculateMasteryLevel(
  topic: string,
  performanceHistory: number[],
  completedActivities: string[]
): Promise<{
  level: "novice" | "beginner" | "intermediate" | "advanced" | "expert";
  score: number;
  description: string;
}> {
  const averagePerformance = performanceHistory.length > 0 ? performanceHistory.reduce((a, b) => a + b) / performanceHistory.length : 0;

  let level: "novice" | "beginner" | "intermediate" | "advanced" | "expert";
  if (averagePerformance < 40) level = "novice";
  else if (averagePerformance < 60) level = "beginner";
  else if (averagePerformance < 75) level = "intermediate";
  else if (averagePerformance < 90) level = "advanced";
  else level = "expert";

  const prompt = `
Describe mastery level for "${topic}":
- Level: ${level}
- Average Performance: ${averagePerformance}%
- Activities Completed: ${completedActivities.length}

Provide:
1. What this level means
2. What the learner can do
3. What to work on next
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Describe mastery levels clearly and encouragingly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return {
    level,
    score: averagePerformance,
    description: response.choices[0]?.message?.content as string,
  };
}

/**
 * Generate progress report
 */
export async function generateProgressReport(metrics: ProgressMetrics): Promise<string> {
  const prompt = `
Generate a comprehensive progress report:

Topic: ${metrics.topic}
Lessons Completed: ${metrics.totalLessonsCompleted}
Average Score: ${metrics.averageScore}%
Confidence Growth: ${metrics.confidenceGrowth}%
Mastery Level: ${metrics.masteryLevel}
Time to Mastery: ${metrics.estimatedTimeToMastery} hours

Strengths: ${metrics.strengths.join(", ")}
Areas for Improvement: ${metrics.areasForImprovement.join(", ")}

Create a motivating, detailed progress report that:
1. Celebrates achievements
2. Shows clear progress
3. Identifies next milestones
4. Provides actionable recommendations
5. Builds confidence
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate comprehensive, motivating progress reports.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content as string;
}

/**
 * Predict time to mastery
 */
export async function predictTimeToMastery(
  topic: string,
  currentLevel: "beginner" | "intermediate" | "advanced",
  learningPace: "slow" | "moderate" | "fast",
  hoursPerWeek: number
): Promise<number> {
  const paceMultiplier = { slow: 1.5, moderate: 1, fast: 0.7 };
  const levelHours = { beginner: 20, intermediate: 40, advanced: 60 };

  const estimatedHours = (levelHours[currentLevel] || 40) * paceMultiplier[learningPace];
  const weeksNeeded = estimatedHours / hoursPerWeek;

  return Math.ceil(weeksNeeded * 7); // return days
}

export default {
  assessConfidence,
  calculateSelfEfficacy,
  generateConfidenceFeedback,
  calculateMasteryLevel,
  generateProgressReport,
  predictTimeToMastery,
};
