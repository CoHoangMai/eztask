/**
 * Utility functions for AI-assisted task breakdown and smart suggestions.
 */

export interface GeneratedSubtask {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * Fallback generator or prompt formulation for breaking a task into checklist items.
 */
export const generateSubtasksPrompt = (title: string, description?: string): string => {
  return `Given the task title "${title}" and description "${description || 'None'}", generate a concise list of 3-5 concrete, actionable step-by-step subtasks. Return each step on a new line.`;
};

/**
 * Parses raw text lines into checklist items.
 */
export const parseSubtasksFromText = (rawText: string): GeneratedSubtask[] => {
  const lines = rawText
    .split('\n')
    .map(line => line.replace(/^[-*•\d.]+\s*/, '').trim())
    .filter(line => line.length > 0);

  return lines.slice(0, 6).map((text, idx) => ({
    id: `chk-ai-${Date.now()}-${idx}`,
    text,
    completed: false,
  }));
};

/**
 * Client-side smart subtask generator when no remote backend server is attached.
 */
export const generateClientSubtasks = (title: string): string[] => {
  const lower = title.toLowerCase();

  if (lower.includes('auth') || lower.includes('login') || lower.includes('user')) {
    return [
      'Design user authentication flow & form validation',
      'Implement JWT token handling & secure cookie storage',
      'Add password reset & email verification triggers',
      'Write integration tests for login/register endpoints',
    ];
  }

  if (lower.includes('api') || lower.includes('backend') || lower.includes('server')) {
    return [
      'Define OpenAPI / Swagger schema specifications',
      'Implement REST controller routes and validation middlewares',
      'Connect database queries with connection pooling',
      'Conduct load testing and error handling verification',
    ];
  }

  if (lower.includes('ui') || lower.includes('design') || lower.includes('page') || lower.includes('component')) {
    return [
      'Create high-fidelity wireframe & review design tokens',
      'Build responsive layout structure with Tailwind CSS',
      'Add micro-interactions, hover states & ARIA accessibility attributes',
      'Test across mobile, tablet, and desktop breakpoints',
    ];
  }

  return [
    `Analyze requirements and dependencies for "${title}"`,
    'Draft initial technical solution and architecture',
    'Implement core feature components and business logic',
    'Perform QA validation, edge-case testing, and code review',
  ];
};
