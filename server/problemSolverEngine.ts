/**
 * Advanced Problem-Solving Engine
 * Analyzes complex problems and provides rapid, accurate solutions
 */

import { invokeLLM } from "./_core/llm";

export interface Problem {
  id: string;
  title: string;
  description: string;
  category: "math" | "science" | "programming" | "business" | "general";
  difficulty: "easy" | "medium" | "hard" | "expert";
  context?: string;
  attachments?: string[];
}

export interface Solution {
  id: string;
  problemId: string;
  summary: string;
  steps: SolutionStep[];
  keyInsights: string[];
  relatedConcepts: string[];
  confidence: number; // 0-1
  timeToSolve: number; // minutes
  resources: Resource[];
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formula?: string;
  example?: string;
  commonMistakes?: string[];
  tips?: string[];
}

export interface Resource {
  type: "article" | "video" | "tool" | "formula";
  title: string;
  url?: string;
  description: string;
}

/**
 * Analyze a complex problem and generate comprehensive solution
 */
export async function analyzeProblem(problem: Problem): Promise<Solution> {
  const prompt = `
You are an expert problem-solver. Analyze this problem and provide a comprehensive solution.

Problem: ${problem.title}
Description: ${problem.description}
Category: ${problem.category}
Difficulty: ${problem.difficulty}
${problem.context ? `Context: ${problem.context}` : ""}

Please provide:
1. A clear summary of the problem
2. Step-by-step solution with detailed explanations
3. Key insights and concepts
4. Related concepts to understand better
5. Common mistakes to avoid
6. Tips for solving similar problems

Format your response as JSON with this structure:
{
  "summary": "brief summary",
  "steps": [
    {
      "stepNumber": 1,
      "title": "step title",
      "explanation": "detailed explanation",
      "formula": "if applicable",
      "example": "concrete example",
      "commonMistakes": ["mistake1", "mistake2"],
      "tips": ["tip1", "tip2"]
    }
  ],
  "keyInsights": ["insight1", "insight2"],
  "relatedConcepts": ["concept1", "concept2"],
  "confidence": 0.95,
  "timeToSolve": 15
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert problem-solver who provides accurate, step-by-step solutions. Always respond with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "solution",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  stepNumber: { type: "number" },
                  title: { type: "string" },
                  explanation: { type: "string" },
                  formula: { type: "string" },
                  example: { type: "string" },
                  commonMistakes: { type: "array", items: { type: "string" } },
                  tips: { type: "array", items: { type: "string" } },
                },
                required: ["stepNumber", "title", "explanation"],
              },
            },
            keyInsights: { type: "array", items: { type: "string" } },
            relatedConcepts: { type: "array", items: { type: "string" } },
            confidence: { type: "number" },
            timeToSolve: { type: "number" },
          },
          required: ["summary", "steps", "keyInsights", "relatedConcepts", "confidence", "timeToSolve"],
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return {
    id: `sol_${Date.now()}`,
    problemId: problem.id,
    summary: parsed.summary,
    steps: parsed.steps,
    keyInsights: parsed.keyInsights,
    relatedConcepts: parsed.relatedConcepts,
    confidence: parsed.confidence,
    timeToSolve: parsed.timeToSolve,
    resources: [],
  };
}

/**
 * Verify solution accuracy by checking against known solutions
 */
export async function verifySolution(solution: Solution, problem: Problem): Promise<{
  isValid: boolean;
  accuracy: number;
  feedback: string;
  improvements?: string[];
}> {
  const prompt = `
Verify this solution for accuracy and completeness:

Problem: ${problem.description}
Solution Summary: ${solution.summary}
Steps: ${JSON.stringify(solution.steps)}

Check for:
1. Mathematical/logical correctness
2. Completeness of explanation
3. Clarity and understandability
4. Practical applicability

Respond with JSON:
{
  "isValid": boolean,
  "accuracy": 0-1,
  "feedback": "detailed feedback",
  "improvements": ["improvement1", "improvement2"]
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are an expert verifier. Check solutions for accuracy and provide constructive feedback.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return parsed;
}

/**
 * Generate alternative solutions for the same problem
 */
export async function generateAlternativeSolutions(problem: Problem, count: number = 3): Promise<Solution[]> {
  const solutions: Solution[] = [];

  for (let i = 0; i < count; i++) {
    const prompt = `
Generate an alternative approach to solve this problem (approach ${i + 1}):

Problem: ${problem.title}
Description: ${problem.description}

This should be a different method than the standard approach.
Focus on: ${i === 0 ? "efficiency" : i === 1 ? "simplicity" : "creativity"}

Provide step-by-step solution as JSON.
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Generate creative, alternative solutions to problems.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    solutions.push({
      id: `sol_alt_${i}_${Date.now()}`,
      problemId: problem.id,
      summary: parsed.summary || "Alternative approach",
      steps: parsed.steps || [],
      keyInsights: parsed.keyInsights || [],
      relatedConcepts: parsed.relatedConcepts || [],
      confidence: parsed.confidence || 0.85,
      timeToSolve: parsed.timeToSolve || 20,
      resources: [],
    });
  }

  return solutions;
}

/**
 * Break down complex problem into simpler sub-problems
 */
export async function breakDownProblem(problem: Problem): Promise<{
  subProblems: Problem[];
  solvingStrategy: string;
  estimatedComplexity: number;
}> {
  const prompt = `
Break down this complex problem into simpler sub-problems:

Problem: ${problem.title}
Description: ${problem.description}
Difficulty: ${problem.difficulty}

Identify:
1. Sub-problems that need to be solved
2. Order of solving (dependencies)
3. Overall solving strategy
4. Complexity estimation

Respond with JSON.
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Break down complex problems into manageable sub-problems.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  const subProblems: Problem[] = (parsed.subProblems || []).map((sp: any, idx: number) => ({
    id: `subproblem_${idx}_${Date.now()}`,
    title: sp.title || `Sub-problem ${idx + 1}`,
    description: sp.description || "",
    category: problem.category,
    difficulty: sp.difficulty || "easy",
  }));

  return {
    subProblems,
    solvingStrategy: parsed.solvingStrategy || "Sequential solving",
    estimatedComplexity: parsed.estimatedComplexity || 5,
  };
}

/**
 * Find similar problems from knowledge base
 */
export async function findSimilarProblems(problem: Problem, limit: number = 5): Promise<Problem[]> {
  // In production, this would query a knowledge base
  // For now, return placeholder
  return [];
}

/**
 * Generate practice problems based on the original problem
 */
export async function generatePracticeProblems(problem: Problem, count: number = 3): Promise<Problem[]> {
  const problems: Problem[] = [];

  for (let i = 0; i < count; i++) {
    const prompt = `
Generate a practice problem similar to this one (difficulty: ${i === 0 ? "medium" : i === 1 ? "hard" : "expert"}):

Original Problem: ${problem.title}
Description: ${problem.description}
Category: ${problem.category}

Create a new problem that:
1. Uses the same concepts
2. Has slightly different numbers/context
3. Requires similar problem-solving approach
4. Is appropriate for the specified difficulty

Respond with JSON:
{
  "title": "problem title",
  "description": "problem description",
  "difficulty": "difficulty level"
}
`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Generate practice problems for learning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    problems.push({
      id: `practice_${i}_${Date.now()}`,
      title: parsed.title || `Practice Problem ${i + 1}`,
      description: parsed.description || "",
      category: problem.category,
      difficulty: (parsed.difficulty as any) || "medium",
    });
  }

  return problems;
}

export default {
  analyzeProblem,
  verifySolution,
  generateAlternativeSolutions,
  breakDownProblem,
  findSimilarProblems,
  generatePracticeProblems,
};
