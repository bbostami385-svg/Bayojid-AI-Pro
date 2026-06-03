/**
 * Intelligent Notes & Diagrams Generator
 * Creates visual learning materials including notes and diagrams
 */

import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

export interface StudyNotes {
  id: string;
  topic: string;
  level: "beginner" | "intermediate" | "advanced";
  format: "markdown" | "outline" | "mindmap" | "flashcards";
  content: string;
  keyTerms: Map<string, string>;
  formulas: Formula[];
  mnemonics: string[];
  reviewQuestions: string[];
}

export interface Formula {
  name: string;
  expression: string;
  explanation: string;
  example: string;
}

export interface DiagramDescription {
  id: string;
  title: string;
  type: "flowchart" | "mindmap" | "venn" | "timeline" | "graph" | "concept_map";
  description: string;
  elements: DiagramElement[];
  relationships: Relationship[];
  imagePrompt: string;
}

export interface DiagramElement {
  id: string;
  label: string;
  type: "box" | "circle" | "diamond" | "arrow" | "text";
  properties: Record<string, unknown>;
}

export interface Relationship {
  from: string;
  to: string;
  label: string;
  type: "connection" | "hierarchy" | "causation" | "comparison";
}

/**
 * Generate comprehensive study notes
 */
export async function generateStudyNotes(
  topic: string,
  level: "beginner" | "intermediate" | "advanced",
  format: "markdown" | "outline" | "mindmap" | "flashcards" = "markdown"
): Promise<StudyNotes> {
  const prompt = `
Generate comprehensive study notes for "${topic}" at ${level} level in ${format} format.

Include:
1. Main concepts and definitions
2. Key formulas and equations
3. Important relationships
4. Mnemonics for memorization
5. Review questions
6. Common mistakes

Format as ${format}:
${format === "markdown" ? "Use markdown with headers, bold, italics" : ""}
${format === "outline" ? "Use hierarchical outline structure" : ""}
${format === "mindmap" ? "Use mind map structure with branches" : ""}
${format === "flashcards" ? "Create Q&A pairs" : ""}

Respond with JSON:
{
  "content": "formatted content",
  "keyTerms": {"term": "definition"},
  "formulas": [
    {
      "name": "formula name",
      "expression": "mathematical expression",
      "explanation": "what it means",
      "example": "example usage"
    }
  ],
  "mnemonics": ["mnemonic1"],
  "reviewQuestions": ["question1"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate well-organized, comprehensive study notes.",
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
    id: `notes_${Date.now()}`,
    topic,
    level,
    format,
    content: parsed.content || "",
    keyTerms: new Map(Object.entries(parsed.keyTerms || {})),
    formulas: parsed.formulas || [],
    mnemonics: parsed.mnemonics || [],
    reviewQuestions: parsed.reviewQuestions || [],
  };
}

/**
 * Generate diagram descriptions for visualization
 */
export async function generateDiagramDescription(
  topic: string,
  conceptsToVisualize: string[],
  diagramType: "flowchart" | "mindmap" | "venn" | "timeline" | "graph" | "concept_map" = "concept_map"
): Promise<DiagramDescription> {
  const prompt = `
Create a ${diagramType} diagram description for "${topic}".

Concepts to visualize: ${conceptsToVisualize.join(", ")}

Generate:
1. Diagram title
2. List of elements (boxes, circles, etc.)
3. Relationships between elements
4. Detailed description for AI image generation

Respond with JSON:
{
  "title": "diagram title",
  "description": "detailed description",
  "elements": [
    {
      "id": "elem1",
      "label": "element label",
      "type": "box/circle/diamond/arrow/text"
    }
  ],
  "relationships": [
    {
      "from": "elem1",
      "to": "elem2",
      "label": "relationship label",
      "type": "connection/hierarchy/causation/comparison"
    }
  ],
  "imagePrompt": "detailed prompt for image generation"
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create detailed diagram descriptions for educational visualization.",
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
    id: `diagram_${Date.now()}`,
    title: parsed.title || topic,
    type: diagramType,
    description: parsed.description || "",
    elements: parsed.elements || [],
    relationships: parsed.relationships || [],
    imagePrompt: parsed.imagePrompt || `Educational ${diagramType} diagram about ${topic}`,
  };
}

/**
 * Generate flashcards for memorization
 */
export async function generateFlashcards(topic: string, count: number = 10): Promise<Flashcard[]> {
  const prompt = `
Generate ${count} flashcards for memorizing key concepts about "${topic}".

Each flashcard should have:
1. Clear, concise question
2. Accurate answer
3. Difficulty level
4. Memory aid or mnemonic
5. Related concept

Respond with JSON array of flashcards:
{
  "flashcards": [
    {
      "question": "question text",
      "answer": "answer text",
      "difficulty": "easy/medium/hard",
      "memoryAid": "memory aid",
      "relatedConcept": "related concept"
    }
  ]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate effective flashcards for learning and memorization.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return (parsed.flashcards || []).map((fc: any, idx: number) => ({
    id: `fc_${idx}`,
    question: fc.question || "",
    answer: fc.answer || "",
    difficulty: fc.difficulty || "medium",
    memoryAid: fc.memoryAid || "",
    relatedConcept: fc.relatedConcept || "",
  }));
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
  memoryAid: string;
  relatedConcept: string;
}

/**
 * Generate comparison tables
 */
export async function generateComparisonTable(
  topic: string,
  itemsToCompare: string[]
): Promise<ComparisonTable> {
  const prompt = `
Create a comprehensive comparison table for "${topic}".

Items to compare: ${itemsToCompare.join(", ")}

Generate:
1. Relevant comparison criteria
2. Detailed comparison data
3. Summary of key differences
4. When to use each item

Respond with JSON:
{
  "title": "table title",
  "criteria": ["criterion1"],
  "rows": [
    {
      "item": "item name",
      "values": {"criterion1": "value1"}
    }
  ],
  "summary": "key differences summary"
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate comprehensive comparison tables.",
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
    id: `table_${Date.now()}`,
    title: parsed.title || `Comparison: ${itemsToCompare.join(" vs ")}`,
    criteria: parsed.criteria || [],
    rows: parsed.rows || [],
    summary: parsed.summary || "",
  };
}

export interface ComparisonTable {
  id: string;
  title: string;
  criteria: string[];
  rows: ComparisonRow[];
  summary: string;
}

export interface ComparisonRow {
  item: string;
  values: Record<string, string>;
}

/**
 * Generate visual summary infographic description
 */
export async function generateInfographicDescription(topic: string, keyPoints: string[]): Promise<string> {
  const prompt = `
Create a detailed description for an educational infographic about "${topic}".

Key points to include: ${keyPoints.join(", ")}

The description should:
1. Be detailed enough for AI image generation
2. Include visual hierarchy
3. Use icons and visual metaphors
4. Be colorful and engaging
5. Include all key information

Format: "An infographic showing [detailed description]"
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Create detailed descriptions for educational infographics.",
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
 * Generate timeline for historical or sequential topics
 */
export async function generateTimeline(topic: string, events: string[]): Promise<TimelineItem[]> {
  const prompt = `
Create a timeline for "${topic}".

Events to include: ${events.join(", ")}

Generate:
1. Chronological order
2. Dates/periods
3. Descriptions
4. Significance
5. Visual descriptions

Respond with JSON array of timeline items.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Generate comprehensive timelines for educational topics.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return parsed.timeline || [];
}

export interface TimelineItem {
  date: string;
  event: string;
  description: string;
  significance: string;
  visualDescription?: string;
}

export default {
  generateStudyNotes,
  generateDiagramDescription,
  generateFlashcards,
  generateComparisonTable,
  generateInfographicDescription,
  generateTimeline,
};
