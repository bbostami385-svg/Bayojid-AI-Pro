/**
 * Step-by-Step Learning Path Generator
 * Creates personalized learning paths with guided progression
 */

import { invokeLLM } from "./_core/llm";

export interface PersonalizedLearningPath {
  id: string;
  userId: number;
  topic: string;
  currentLevel: "beginner" | "intermediate" | "advanced";
  targetLevel: "beginner" | "intermediate" | "advanced";
  steps: LearningStep[];
  progress: number; // 0-100
  estimatedDuration: number; // minutes
  completedSteps: string[];
}

export interface LearningStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  content: string;
  learningObjectives: string[];
  activities: Activity[];
  assessment: Assessment;
  resources: Resource[];
  estimatedTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  prerequisites: string[];
  nextSteps: string[];
}

export interface Activity {
  id: string;
  type: "reading" | "video" | "exercise" | "project" | "quiz";
  title: string;
  description: string;
  content: string;
  duration: number; // minutes
  isRequired: boolean;
}

export interface Assessment {
  id: string;
  type: "quiz" | "exercise" | "project" | "reflection";
  questions: AssessmentQuestion[];
  passingScore: number; // 0-100
  feedback: string;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "short_answer" | "coding" | "reflection";
  options?: string[];
  correctAnswer?: string;
  rubric?: string;
}

export interface Resource {
  type: "article" | "video" | "tool" | "documentation";
  title: string;
  url?: string;
  description: string;
  duration?: number;
}

/**
 * Generate personalized learning path
 */
export async function generatePersonalizedPath(
  userId: number,
  topic: string,
  currentLevel: "beginner" | "intermediate" | "advanced",
  targetLevel: "beginner" | "intermediate" | "advanced",
  learningStyle: string = "mixed"
): Promise<PersonalizedLearningPath> {
  const prompt = `
Create a personalized learning path for a ${learningStyle} learner.

Topic: ${topic}
Current Level: ${currentLevel}
Target Level: ${targetLevel}
Learning Style: ${learningStyle}

Generate a structured path with:
1. Clear learning objectives for each step
2. Varied activities (reading, video, exercises)
3. Regular assessments
4. Progressive difficulty
5. Estimated time for each step

Respond with JSON:
{
  "steps": [
    {
      "stepNumber": 1,
      "title": "step title",
      "description": "description",
      "content": "detailed content",
      "learningObjectives": ["objective1"],
      "estimatedTime": 30,
      "difficulty": "easy",
      "activities": [
        {
          "type": "reading",
          "title": "activity title",
          "description": "description",
          "duration": 15,
          "isRequired": true
        }
      ],
      "assessment": {
        "type": "quiz",
        "questions": [
          {
            "question": "question text",
            "type": "multiple_choice",
            "options": ["A", "B", "C"],
            "correctAnswer": "A"
          }
        ],
        "passingScore": 70
      }
    }
  ],
  "estimatedDuration": 300
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create personalized, structured learning paths tailored to individual needs.",
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
    id: `path_${userId}_${Date.now()}`,
    userId,
    topic,
    currentLevel,
    targetLevel,
    progress: 0,
    estimatedDuration: parsed.estimatedDuration || 300,
    completedSteps: [],
    steps: (parsed.steps || []).map((s: any, idx: number) => ({
      id: `step_${idx}`,
      stepNumber: s.stepNumber || idx + 1,
      title: s.title || `Step ${idx + 1}`,
      description: s.description || "",
      content: s.content || "",
      learningObjectives: s.learningObjectives || [],
      estimatedTime: s.estimatedTime || 30,
      difficulty: s.difficulty || "medium",
      prerequisites: s.prerequisites || [],
      nextSteps: s.nextSteps || [],
      activities: s.activities || [],
      assessment: s.assessment || {},
      resources: s.resources || [],
    })),
  };
}

/**
 * Generate adaptive next step based on performance
 */
export async function generateAdaptiveNextStep(
  path: PersonalizedLearningPath,
  currentStepId: string,
  performanceScore: number
): Promise<LearningStep> {
  const currentStep = path.steps.find((s) => s.id === currentStepId);

  const prompt = `
Generate the next learning step based on performance.

Current Step: ${currentStep?.title}
Performance Score: ${performanceScore}%
Topic: ${path.topic}
Target Level: ${path.targetLevel}

If performance is high (>80%), move to next level.
If performance is medium (60-80%), provide reinforcement.
If performance is low (<60%), provide additional practice.

Create next step that:
1. Matches the learner's pace
2. Provides appropriate challenge
3. Includes reinforcement if needed
4. Builds on previous knowledge

Respond with JSON for the next step.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate adaptive learning steps based on performance.",
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
    id: `adaptive_step_${Date.now()}`,
    stepNumber: (currentStep?.stepNumber || 0) + 1,
    title: parsed.title || "Next Step",
    description: parsed.description || "",
    content: parsed.content || "",
    learningObjectives: parsed.learningObjectives || [],
    estimatedTime: parsed.estimatedTime || 30,
    difficulty: parsed.difficulty || "medium",
    prerequisites: parsed.prerequisites || [],
    nextSteps: parsed.nextSteps || [],
    activities: parsed.activities || [],
    assessment: parsed.assessment || {},
    resources: parsed.resources || [],
  };
}

/**
 * Generate detailed explanation for a concept
 */
export async function explainConcept(
  concept: string,
  level: "beginner" | "intermediate" | "advanced",
  context?: string
): Promise<ConceptExplanation> {
  const prompt = `
Explain the concept "${concept}" at ${level} level.

${context ? `Context: ${context}` : ""}

Provide:
1. Simple definition
2. Detailed explanation
3. Real-world examples
4. Common misconceptions
5. Practice questions
6. Related concepts

Respond with JSON:
{
  "definition": "simple definition",
  "explanation": "detailed explanation",
  "examples": ["example1", "example2"],
  "misconceptions": ["misconception1"],
  "practiceQuestions": ["question1"],
  "relatedConcepts": ["concept1"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Provide clear, comprehensive concept explanations.",
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
    id: `concept_${Date.now()}`,
    concept,
    level,
    definition: parsed.definition || "",
    explanation: parsed.explanation || "",
    examples: parsed.examples || [],
    misconceptions: parsed.misconceptions || [],
    practiceQuestions: parsed.practiceQuestions || [],
    relatedConcepts: parsed.relatedConcepts || [],
  };
}

export interface ConceptExplanation {
  id: string;
  concept: string;
  level: "beginner" | "intermediate" | "advanced";
  definition: string;
  explanation: string;
  examples: string[];
  misconceptions: string[];
  practiceQuestions: string[];
  relatedConcepts: string[];
}

/**
 * Generate reflection prompts for deep learning
 */
export async function generateReflectionPrompts(topic: string, stepNumber: number): Promise<string[]> {
  const prompt = `
Generate reflection prompts for deep learning about "${topic}" (step ${stepNumber}).

Create 5-7 thought-provoking questions that:
1. Encourage critical thinking
2. Connect to real-world applications
3. Build metacognitive awareness
4. Promote self-assessment
5. Encourage peer discussion

Respond with JSON array of prompts.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate thoughtful reflection prompts for deeper learning.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return parsed.prompts || [];
}

/**
 * Generate confidence-building affirmations
 */
export async function generateAffirmations(topic: string, currentProgress: number): Promise<string[]> {
  const prompt = `
Generate encouraging affirmations for a learner studying "${topic}".

Current Progress: ${currentProgress}%

Create 5-7 personalized affirmations that:
1. Acknowledge progress made
2. Build confidence
3. Encourage persistence
4. Celebrate learning
5. Are specific to the topic

Respond with JSON array of affirmations.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate encouraging, personalized affirmations for learners.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return parsed.affirmations || [];
}

export default {
  generatePersonalizedPath,
  generateAdaptiveNextStep,
  explainConcept,
  generateReflectionPrompts,
  generateAffirmations,
};
