/**
 * Educational Content Generation System
 * Generates comprehensive learning materials for any topic
 */

import { invokeLLM } from "./_core/llm";

export interface EducationalContent {
  id: string;
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  format: "article" | "guide" | "tutorial" | "course";
  sections: ContentSection[];
  summary: string;
  keyTerms: string[];
  prerequisites: string[];
  learningOutcomes: string[];
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
  examples: Example[];
  exercises: Exercise[];
  keyPoints: string[];
  visualDescription?: string;
}

export interface Example {
  title: string;
  description: string;
  code?: string;
  explanation: string;
}

export interface Exercise {
  id: string;
  question: string;
  difficulty: "easy" | "medium" | "hard";
  hints: string[];
  solution: string;
  explanation: string;
}

/**
 * Generate comprehensive educational content for a topic
 */
export async function generateEducationalContent(
  topic: string,
  level: "beginner" | "intermediate" | "advanced",
  format: "article" | "guide" | "tutorial" | "course"
): Promise<EducationalContent> {
  const prompt = `
Generate comprehensive educational content about "${topic}" at ${level} level in ${format} format.

Create structured content with:
1. Clear sections with explanations
2. Practical examples
3. Key concepts highlighted
4. Learning outcomes
5. Prerequisites

Respond with JSON structure:
{
  "summary": "brief summary",
  "keyTerms": ["term1", "term2"],
  "prerequisites": ["prereq1"],
  "learningOutcomes": ["outcome1"],
  "sections": [
    {
      "title": "section title",
      "content": "detailed content",
      "keyPoints": ["point1"],
      "examples": [
        {
          "title": "example title",
          "description": "description",
          "explanation": "why this example"
        }
      ],
      "exercises": [
        {
          "question": "exercise question",
          "difficulty": "easy",
          "hints": ["hint1"],
          "solution": "solution",
          "explanation": "explanation"
        }
      ]
    }
  ]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert educator. Create clear, comprehensive educational content.",
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
    id: `edu_${Date.now()}`,
    topic,
    level,
    format,
    summary: parsed.summary || "",
    keyTerms: parsed.keyTerms || [],
    prerequisites: parsed.prerequisites || [],
    learningOutcomes: parsed.learningOutcomes || [],
    sections: (parsed.sections || []).map((s: any, idx: number) => ({
      id: `section_${idx}`,
      title: s.title || "",
      content: s.content || "",
      keyPoints: s.keyPoints || [],
      examples: s.examples || [],
      exercises: s.exercises || [],
      visualDescription: s.visualDescription,
    })),
  };
}

/**
 * Generate study notes from educational content
 */
export async function generateStudyNotes(content: EducationalContent): Promise<string> {
  const prompt = `
Create concise, well-organized study notes from this educational content:

Topic: ${content.topic}
Level: ${content.level}

Content sections:
${content.sections.map((s) => `- ${s.title}: ${s.content.substring(0, 200)}...`).join("\n")}

Generate notes in markdown format with:
1. Main concepts
2. Key definitions
3. Important formulas/rules
4. Quick review points
5. Common mistakes to avoid
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create clear, concise study notes in markdown format.",
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
 * Generate visual descriptions for diagrams
 */
export async function generateDiagramDescriptions(content: EducationalContent): Promise<Map<string, string>> {
  const diagrams = new Map<string, string>();

  for (const section of content.sections) {
    const prompt = `
Create a detailed description for a diagram that would help explain: "${section.title}"

Context: ${section.content.substring(0, 300)}

The diagram description should:
1. Be detailed enough for an AI to generate it
2. Include all key elements
3. Show relationships between concepts
4. Use clear, visual language

Format: "A diagram showing [description]"
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Create detailed descriptions for educational diagrams.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const description = response.choices[0]?.message?.content as string;
    diagrams.set(section.id, description);
  }

  return diagrams;
}

/**
 * Generate quiz questions from content
 */
export async function generateQuiz(content: EducationalContent, questionCount: number = 10): Promise<QuizQuestion[]> {
  const prompt = `
Generate ${questionCount} quiz questions based on this educational content:

Topic: ${content.topic}
Level: ${content.level}

Key concepts: ${content.keyTerms.join(", ")}

Create questions that:
1. Test understanding of key concepts
2. Include multiple choice, true/false, and short answer
3. Have varying difficulty levels
4. Include explanations for answers

Respond with JSON array of questions.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate educational quiz questions with detailed explanations.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content_text = response.choices[0]?.message?.content;
  const parsed = typeof content_text === "string" ? JSON.parse(content_text) : content_text;

  return parsed.questions || [];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

/**
 * Generate learning path for a topic
 */
export async function generateLearningPath(topic: string): Promise<LearningPath> {
  const prompt = `
Create a comprehensive learning path for "${topic}".

Include:
1. Prerequisites
2. Beginner level topics
3. Intermediate level topics
4. Advanced level topics
5. Projects/applications
6. Resources

Respond with JSON:
{
  "title": "learning path title",
  "duration": "estimated duration",
  "stages": [
    {
      "level": "beginner/intermediate/advanced",
      "topics": ["topic1"],
      "duration": "duration",
      "projects": ["project1"]
    }
  ],
  "resources": ["resource1"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create comprehensive learning paths for educational topics.",
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
    id: `path_${Date.now()}`,
    title: parsed.title || topic,
    topic,
    duration: parsed.duration || "4 weeks",
    stages: parsed.stages || [],
    resources: parsed.resources || [],
  };
}

export interface LearningPath {
  id: string;
  title: string;
  topic: string;
  duration: string;
  stages: LearningStage[];
  resources: string[];
}

export interface LearningStage {
  level: "beginner" | "intermediate" | "advanced";
  topics: string[];
  duration: string;
  projects: string[];
}

/**
 * Generate summary of content
 */
export async function generateSummary(content: EducationalContent, length: "short" | "medium" | "long" = "medium"): Promise<string> {
  const lengthGuide = {
    short: "2-3 paragraphs",
    medium: "5-7 paragraphs",
    long: "10-15 paragraphs",
  };

  const prompt = `
Create a ${lengthGuide[length]} summary of this educational content:

Topic: ${content.topic}
Level: ${content.level}

Key points to cover:
${content.learningOutcomes.map((o) => `- ${o}`).join("\n")}

The summary should be clear, concise, and suitable for ${content.level} learners.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create clear, concise educational summaries.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.choices[0]?.message?.content as string;
}

export default {
  generateEducationalContent,
  generateStudyNotes,
  generateDiagramDescriptions,
  generateQuiz,
  generateLearningPath,
  generateSummary,
};
