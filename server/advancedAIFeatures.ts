/**
 * Advanced AI Features Service
 * Implements prompt templates, custom instructions, and AI-driven summaries
 */

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  tags: string[];
  isPublic: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface CustomInstruction {
  id: string;
  userId: number;
  title: string;
  instruction: string;
  priority: 'low' | 'medium' | 'high';
  appliedToModels: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  actionItems: string[];
  generatedAt: Date;
  generatedBy: string; // model name
}

export interface AIInsight {
  id: string;
  conversationId: string;
  type: 'recommendation' | 'question' | 'clarification' | 'follow_up';
  content: string;
  confidence: number;
  generatedAt: Date;
}

const promptTemplates: Map<string, PromptTemplate> = new Map();
const customInstructions: Map<string, CustomInstruction> = new Map();
const conversationSummaries: Map<string, ConversationSummary> = new Map();
const aiInsights: Map<string, AIInsight> = new Map();

// Default prompt templates
const defaultTemplates = [
  {
    name: 'Code Review',
    description: 'Review and improve code quality',
    category: 'Development',
    template: 'Please review the following code and suggest improvements:\n\n```\n{code}\n```\n\nFocus on: {focus_areas}',
    variables: ['code', 'focus_areas'],
    tags: ['code', 'review', 'development'],
  },
  {
    name: 'Content Writing',
    description: 'Generate engaging content',
    category: 'Writing',
    template: 'Write a {tone} {content_type} about {topic}. Target audience: {audience}. Length: {length} words.',
    variables: ['tone', 'content_type', 'topic', 'audience', 'length'],
    tags: ['content', 'writing', 'marketing'],
  },
  {
    name: 'Data Analysis',
    description: 'Analyze and interpret data',
    category: 'Analysis',
    template: 'Analyze the following data and provide insights:\n\n{data}\n\nFocus on: {analysis_focus}',
    variables: ['data', 'analysis_focus'],
    tags: ['data', 'analysis', 'statistics'],
  },
  {
    name: 'Problem Solving',
    description: 'Help solve complex problems',
    category: 'Problem Solving',
    template: 'I have a problem: {problem}\n\nContext: {context}\n\nConstraints: {constraints}\n\nPlease provide solutions.',
    variables: ['problem', 'context', 'constraints'],
    tags: ['problem', 'solution', 'brainstorm'],
  },
  {
    name: 'Learning Assistant',
    description: 'Learn new topics effectively',
    category: 'Education',
    template: 'Explain {topic} in a way that\'s easy for {skill_level} to understand. Include {include_items}.',
    variables: ['topic', 'skill_level', 'include_items'],
    tags: ['learning', 'education', 'tutorial'],
  },
];

/**
 * Initialize default prompt templates
 */
export function initializeDefaultTemplates(): void {
  defaultTemplates.forEach((template, index) => {
    const id = `template-default-${index}`;
    promptTemplates.set(id, {
      id,
      name: template.name,
      description: template.description,
      category: template.category,
      template: template.template,
      variables: template.variables,
      tags: template.tags,
      isPublic: true,
      createdBy: 0, // System
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    });
  });
}

/**
 * Create custom prompt template
 */
export function createPromptTemplate(
  userId: number,
  name: string,
  description: string,
  category: string,
  template: string,
  variables: string[],
  tags: string[],
  isPublic: boolean = false
): PromptTemplate {
  const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newTemplate: PromptTemplate = {
    id,
    name,
    description,
    category,
    template,
    variables,
    tags,
    isPublic,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  };

  promptTemplates.set(id, newTemplate);
  return newTemplate;
}

/**
 * Get prompt template
 */
export function getPromptTemplate(templateId: string): PromptTemplate | undefined {
  return promptTemplates.get(templateId);
}

/**
 * Get all prompt templates
 */
export function getAllPromptTemplates(): PromptTemplate[] {
  return Array.from(promptTemplates.values());
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return Array.from(promptTemplates.values()).filter((t) => t.category === category);
}

/**
 * Get user templates
 */
export function getUserTemplates(userId: number): PromptTemplate[] {
  return Array.from(promptTemplates.values()).filter(
    (t) => t.createdBy === userId || t.isPublic
  );
}

/**
 * Update prompt template
 */
export function updatePromptTemplate(
  templateId: string,
  updates: Partial<PromptTemplate>
): PromptTemplate | undefined {
  const template = promptTemplates.get(templateId);
  if (!template) return undefined;

  Object.assign(template, updates, { updatedAt: new Date() });
  return template;
}

/**
 * Delete prompt template
 */
export function deletePromptTemplate(templateId: string): boolean {
  return promptTemplates.delete(templateId);
}

/**
 * Increment template usage
 */
export function incrementTemplateUsage(templateId: string): void {
  const template = promptTemplates.get(templateId);
  if (template) {
    template.usageCount++;
  }
}

/**
 * Create custom instruction
 */
export function createCustomInstruction(
  userId: number,
  title: string,
  instruction: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  appliedToModels: string[] = []
): CustomInstruction {
  const id = `instr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const newInstruction: CustomInstruction = {
    id,
    userId,
    title,
    instruction,
    priority,
    appliedToModels,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  customInstructions.set(id, newInstruction);
  return newInstruction;
}

/**
 * Get user custom instructions
 */
export function getUserCustomInstructions(userId: number): CustomInstruction[] {
  return Array.from(customInstructions.values()).filter((i) => i.userId === userId);
}

/**
 * Get active custom instructions
 */
export function getActiveCustomInstructions(userId: number): CustomInstruction[] {
  return getUserCustomInstructions(userId).filter((i) => i.isActive);
}

/**
 * Update custom instruction
 */
export function updateCustomInstruction(
  instructionId: string,
  updates: Partial<CustomInstruction>
): CustomInstruction | undefined {
  const instruction = customInstructions.get(instructionId);
  if (!instruction) return undefined;

  Object.assign(instruction, updates, { updatedAt: new Date() });
  return instruction;
}

/**
 * Delete custom instruction
 */
export function deleteCustomInstruction(instructionId: string): boolean {
  return customInstructions.delete(instructionId);
}

/**
 * Generate conversation summary
 */
export function generateConversationSummary(
  conversationId: string,
  messages: Array<{ role: string; content: string }>,
  modelName: string
): ConversationSummary {
  const id = `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // TODO: Call AI model to generate summary
  const summary: ConversationSummary = {
    id,
    conversationId,
    summary: 'This is a placeholder summary. Integration with AI model needed.',
    keyPoints: [
      'Key point 1',
      'Key point 2',
      'Key point 3',
    ],
    sentiment: 'neutral',
    topics: ['topic1', 'topic2'],
    actionItems: ['Action item 1', 'Action item 2'],
    generatedAt: new Date(),
    generatedBy: modelName,
  };

  conversationSummaries.set(id, summary);
  return summary;
}

/**
 * Get conversation summary
 */
export function getConversationSummary(conversationId: string): ConversationSummary | undefined {
  for (const [_, summary] of conversationSummaries) {
    if (summary.conversationId === conversationId) {
      return summary;
    }
  }
  return undefined;
}

/**
 * Generate AI insights
 */
export function generateAIInsights(
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): AIInsight[] {
  const insights: AIInsight[] = [];

  // TODO: Implement AI insight generation
  // This would analyze the conversation and generate insights

  return insights;
}

/**
 * Add AI insight
 */
export function addAIInsight(
  conversationId: string,
  type: 'recommendation' | 'question' | 'clarification' | 'follow_up',
  content: string,
  confidence: number = 0.8
): AIInsight {
  const id = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const insight: AIInsight = {
    id,
    conversationId,
    type,
    content,
    confidence,
    generatedAt: new Date(),
  };

  aiInsights.set(id, insight);
  return insight;
}

/**
 * Get conversation insights
 */
export function getConversationInsights(conversationId: string): AIInsight[] {
  return Array.from(aiInsights.values()).filter((i) => i.conversationId === conversationId);
}

/**
 * Get high-confidence insights
 */
export function getHighConfidenceInsights(
  conversationId: string,
  minConfidence: number = 0.8
): AIInsight[] {
  return getConversationInsights(conversationId).filter((i) => i.confidence >= minConfidence);
}

/**
 * Apply prompt template
 */
export function applyPromptTemplate(
  templateId: string,
  variables: Record<string, string>
): string {
  const template = promptTemplates.get(templateId);
  if (!template) return '';

  incrementTemplateUsage(templateId);

  let result = template.template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(`{${key}}`, value);
  }

  return result;
}

/**
 * Get template categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set<string>();
  for (const template of promptTemplates.values()) {
    categories.add(template.category);
  }
  return Array.from(categories).sort();
}

/**
 * Search templates
 */
export function searchTemplates(query: string): PromptTemplate[] {
  const lowerQuery = query.toLowerCase();
  return Array.from(promptTemplates.values()).filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get advanced AI features statistics
 */
export function getAdvancedAIFeaturesStats() {
  return {
    totalTemplates: promptTemplates.size,
    publicTemplates: Array.from(promptTemplates.values()).filter((t) => t.isPublic).length,
    totalCustomInstructions: customInstructions.size,
    activeInstructions: Array.from(customInstructions.values()).filter((i) => i.isActive).length,
    totalSummaries: conversationSummaries.size,
    totalInsights: aiInsights.size,
    mostUsedTemplate: getMostUsedTemplate(),
  };
}

/**
 * Get most used template
 */
function getMostUsedTemplate(): PromptTemplate | null {
  let mostUsed: PromptTemplate | null = null;
  let maxUsage = 0;

  for (const template of promptTemplates.values()) {
    if (template.usageCount > maxUsage) {
      maxUsage = template.usageCount;
      mostUsed = template;
    }
  }

  return mostUsed;
}

/**
 * Export templates
 */
export function exportTemplates(): string {
  const templates = Array.from(promptTemplates.values());
  return JSON.stringify(templates, null, 2);
}

/**
 * Import templates
 */
export function importTemplates(jsonData: string, userId: number): number {
  try {
    const templates = JSON.parse(jsonData) as PromptTemplate[];
    let imported = 0;

    for (const template of templates) {
      const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      promptTemplates.set(id, {
        ...template,
        id,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      });
      imported++;
    }

    return imported;
  } catch (error) {
    console.error('Failed to import templates:', error);
    return 0;
  }
}

// Initialize default templates on module load
initializeDefaultTemplates();
