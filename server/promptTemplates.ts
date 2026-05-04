/**
 * Custom Prompt Templates Service
 * Allows users to create and manage reusable prompt templates
 */

export interface PromptTemplate {
  id: string;
  userId: number;
  name: string;
  description: string;
  category: string;
  prompt: string;
  variables: string[]; // e.g., ['{topic}', '{tone}']
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number; // 0-5
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  defaultValue?: string;
  options?: string[]; // For dropdown variables
}

export interface TemplateCategory {
  name: string;
  description: string;
  icon?: string;
  templates: PromptTemplate[];
}

// In-memory storage
const templates = new Map<string, PromptTemplate>();
const templateCategories = new Map<string, TemplateCategory>();

/**
 * Create a new prompt template
 */
export function createTemplate(
  userId: number,
  name: string,
  prompt: string,
  options?: {
    description?: string;
    category?: string;
    variables?: string[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    tags?: string[];
    isPublic?: boolean;
  }
): PromptTemplate {
  const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const template: PromptTemplate = {
    id,
    userId,
    name,
    description: options?.description || '',
    category: options?.category || 'general',
    prompt,
    variables: options?.variables || extractVariables(prompt),
    model: options?.model,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    tags: options?.tags || [],
    isPublic: options?.isPublic || false,
    usageCount: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  templates.set(id, template);
  return template;
}

/**
 * Extract variables from prompt text
 */
function extractVariables(prompt: string): string[] {
  const regex = /\{([^}]+)\}/g;
  const matches = prompt.match(regex) || [];
  return [...new Set(matches)]; // Remove duplicates
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): PromptTemplate | undefined {
  return templates.get(id);
}

/**
 * Get user's templates
 */
export function getUserTemplates(userId: number): PromptTemplate[] {
  return Array.from(templates.values())
    .filter((t) => t.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get public templates
 */
export function getPublicTemplates(category?: string): PromptTemplate[] {
  return Array.from(templates.values())
    .filter((t) => t.isPublic && (!category || t.category === category))
    .sort((a, b) => b.rating - a.rating);
}

/**
 * Search templates
 */
export function searchTemplates(query: string, filters?: { category?: string; userId?: number; publicOnly?: boolean }): PromptTemplate[] {
  const queryLower = query.toLowerCase();

  return Array.from(templates.values())
    .filter((t) => {
      if (filters?.publicOnly && !t.isPublic) return false;
      if (filters?.userId && t.userId !== filters.userId) return false;
      if (filters?.category && t.category !== filters.category) return false;

      return (
        t.name.toLowerCase().includes(queryLower) ||
        t.description.toLowerCase().includes(queryLower) ||
        t.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      );
    })
    .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Update template
 */
export function updateTemplate(id: string, updates: Partial<PromptTemplate>): PromptTemplate | undefined {
  const template = templates.get(id);
  if (!template) return undefined;

  Object.assign(template, updates, { updatedAt: new Date() });

  // Re-extract variables if prompt changed
  if (updates.prompt) {
    template.variables = extractVariables(updates.prompt);
  }

  return template;
}

/**
 * Delete template
 */
export function deleteTemplate(id: string): boolean {
  return templates.delete(id);
}

/**
 * Use template (increment usage count)
 */
export function useTemplate(id: string): PromptTemplate | undefined {
  const template = templates.get(id);
  if (!template) return undefined;

  template.usageCount++;
  template.updatedAt = new Date();

  return template;
}

/**
 * Rate template
 */
export function rateTemplate(id: string, rating: number): PromptTemplate | undefined {
  const template = templates.get(id);
  if (!template) return undefined;

  // Average the rating
  template.rating = (template.rating * template.usageCount + rating) / (template.usageCount + 1);
  template.updatedAt = new Date();

  return template;
}

/**
 * Fill template with variables
 */
export function fillTemplate(template: PromptTemplate, variables: Record<string, string>): string {
  let filled = template.prompt;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    filled = filled.replace(new RegExp(placeholder, 'g'), value);
  });

  return filled;
}

/**
 * Get template categories
 */
export function getCategories(): TemplateCategory[] {
  return Array.from(templateCategories.values());
}

/**
 * Create or update category
 */
export function createCategory(name: string, description: string, icon?: string): TemplateCategory {
  const category: TemplateCategory = {
    name,
    description,
    icon,
    templates: Array.from(templates.values()).filter((t) => t.category === name),
  };

  templateCategories.set(name, category);
  return category;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return Array.from(templates.values())
    .filter((t) => t.category === category)
    .sort((a, b) => b.usageCount - a.usageCount);
}

/**
 * Clone template
 */
export function cloneTemplate(templateId: string, userId: number, newName?: string): PromptTemplate | undefined {
  const original = templates.get(templateId);
  if (!original) return undefined;

  return createTemplate(userId, newName || `${original.name} (Copy)`, original.prompt, {
    description: original.description,
    category: original.category,
    variables: original.variables,
    model: original.model,
    temperature: original.temperature,
    maxTokens: original.maxTokens,
    tags: original.tags,
    isPublic: false,
  });
}

/**
 * Get popular templates
 */
export function getPopularTemplates(limit: number = 10): PromptTemplate[] {
  return Array.from(templates.values())
    .filter((t) => t.isPublic)
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}

/**
 * Get trending templates (recently created and highly rated)
 */
export function getTrendingTemplates(limit: number = 10): PromptTemplate[] {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  return Array.from(templates.values())
    .filter((t) => t.isPublic && t.createdAt.getTime() > sevenDaysAgo)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Export templates
 */
export function exportTemplates(userId: number): PromptTemplate[] {
  return getUserTemplates(userId);
}

/**
 * Import templates
 */
export function importTemplates(userId: number, templatesData: PromptTemplate[]): number {
  let importedCount = 0;

  templatesData.forEach((templateData) => {
    createTemplate(userId, templateData.name, templateData.prompt, {
      description: templateData.description,
      category: templateData.category,
      variables: templateData.variables,
      model: templateData.model,
      temperature: templateData.temperature,
      maxTokens: templateData.maxTokens,
      tags: templateData.tags,
      isPublic: false, // Always import as private
    });
    importedCount++;
  });

  return importedCount;
}

/**
 * Get template statistics
 */
export function getTemplateStats() {
  const totalTemplates = templates.size;
  const publicTemplates = Array.from(templates.values()).filter((t) => t.isPublic).length;
  const totalUsage = Array.from(templates.values()).reduce((sum, t) => sum + t.usageCount, 0);
  const averageRating = Array.from(templates.values()).reduce((sum, t) => sum + t.rating, 0) / totalTemplates || 0;

  const categories = new Set<string>();
  templates.forEach((t) => categories.add(t.category));

  return {
    totalTemplates,
    publicTemplates,
    privateTemplates: totalTemplates - publicTemplates,
    totalUsage,
    averageRating,
    uniqueCategories: categories.size,
  };
}
