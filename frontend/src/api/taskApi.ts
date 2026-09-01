import { apiRequest } from './apiClient';
import type { Board, CardItem, Label, Assignee, Priority, AutomationRule } from '../types/kanban';

export interface CreateTaskPayload {
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority?: Priority;
  labels?: Label[];
  assignees?: Assignee[];
  dueDate?: string;
  estimatedHours?: number;
  coverColor?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  labels?: Label[];
  assignees?: Assignee[];
  dueDate?: string;
  estimatedHours?: number;
  coverColor?: string;
}

export interface MoveTaskPayload {
  targetColumnId: string;
  targetIndex?: number;
}

// Convert uppercase backend enum to lowercase frontend string
export const normalizeBackendTask = (raw: any): CardItem => {
  const priorityMap: Record<string, Priority> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    low: 'low',
    medium: 'medium',
    high: 'high',
    urgent: 'urgent'
  };

  return {
    id: raw.id || `task-${Date.now()}`,
    boardId: raw.boardId || 'board-default',
    columnId: raw.columnId || 'col-todo',
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    priority: priorityMap[raw.priority] || 'medium',
    labels: Array.isArray(raw.labels) ? raw.labels : [],
    assignees: Array.isArray(raw.assignees) ? raw.assignees : [],
    dueDate: raw.dueDate ? (typeof raw.dueDate === 'string' ? raw.dueDate.split('T')[0] : '') : undefined,
    estimatedHours: raw.estimatedHours || undefined,
    checklist: Array.isArray(raw.checklist) ? raw.checklist : [],
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    coverColor: raw.coverColor || undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

/**
 * Task Management Service API (Spring Boot 3 + MongoDB via Spring Cloud Gateway /api/tasks/*)
 */
export const taskApi = {
  /**
   * Get all boards (optionally filtered by workspaceId)
   */
  async getBoards(workspaceId?: string): Promise<Board[]> {
    try {
      const url = workspaceId ? `/boards?workspaceId=${encodeURIComponent(workspaceId)}` : '/boards';
      const raw = await apiRequest<Board[]>(url, { method: 'GET' });
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  },

  /**
   * Create a new board
   */
  async createBoard(payload: { title: string; category: Board['category'] }): Promise<Board> {
    return apiRequest<Board>('/boards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Add a column to a board
   */
  async addColumn(boardId: string, title: string): Promise<void> {
    await apiRequest<void>(`/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Update column title
   */
  async updateColumn(boardId: string, columnId: string, title: string): Promise<void> {
    await apiRequest<void>(`/boards/${boardId}/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  /**
   * Delete column
   */
  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    await apiRequest<void>(`/boards/${boardId}/columns/${columnId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get all tasks for a specific board
   */
  async getTasksByBoard(boardId: string): Promise<CardItem[]> {
    const rawList = await apiRequest<any[]>(`/tasks/board/${boardId}`, {
      method: 'GET',
    });
    return Array.isArray(rawList) ? rawList.map(normalizeBackendTask) : [];
  },

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<CardItem> {
    const raw = await apiRequest<any>(`/tasks/${id}`, {
      method: 'GET',
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Create a new task (dispatches Kafka TASK_CREATED event on backend)
   */
  async createTask(payload: CreateTaskPayload): Promise<CardItem> {
    const priorityUpper = (payload.priority || 'medium').toUpperCase();
    const raw = await apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        priority: priorityUpper,
        dueDate: payload.dueDate ? `${payload.dueDate}T00:00:00Z` : undefined,
      }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Helper method to create a card in board
   */
  async createCard(boardId: string, cardData: Omit<CardItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardItem> {
    return this.createTask({
      boardId,
      columnId: cardData.columnId,
      title: cardData.title,
      description: cardData.description,
      priority: cardData.priority,
      labels: cardData.labels,
      assignees: cardData.assignees,
      dueDate: cardData.dueDate,
      estimatedHours: cardData.estimatedHours,
      coverColor: cardData.coverColor,
    });
  },

  /**
   * Update task details (dispatches Kafka TASK_UPDATED event on backend)
   */
  async updateTask(id: string, payload: UpdateTaskPayload): Promise<CardItem> {
    const priorityUpper = payload.priority ? payload.priority.toUpperCase() : undefined;
    const raw = await apiRequest<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...payload,
        priority: priorityUpper,
        dueDate: payload.dueDate ? `${payload.dueDate}T00:00:00Z` : undefined,
      }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Helper method to update a card
   */
  async updateCard(card: CardItem): Promise<CardItem> {
    return this.updateTask(card.id, {
      title: card.title,
      description: card.description,
      priority: card.priority,
      labels: card.labels,
      assignees: card.assignees,
      dueDate: card.dueDate,
      estimatedHours: card.estimatedHours,
      coverColor: card.coverColor,
    });
  },

  /**
   * Move task to another column or position (dispatches Kafka TASK_MOVED event)
   */
  async moveTask(id: string, targetColumnId: string, targetIndex?: number): Promise<CardItem> {
    const raw = await apiRequest<any>(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({
        targetColumnId,
        targetIndex,
      }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Helper method to move a card
   */
  async moveCard(id: string, _sourceColId: string, targetColId: string, targetIndex?: number): Promise<CardItem> {
    return this.moveTask(id, targetColId, targetIndex);
  },

  /**
   * Delete a task by ID (dispatches Kafka TASK_DELETED event)
   */
  async deleteTask(id: string): Promise<void> {
    await apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Helper method to delete a card
   */
  async deleteCard(id: string): Promise<void> {
    return this.deleteTask(id);
  },

  /**
   * Add a comment to a task (dispatches Kafka COMMENT_ADDED event)
   */
  async addComment(id: string, text: string): Promise<CardItem> {
    const raw = await apiRequest<any>(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Add a checklist item to a task
   */
  async addChecklistItem(id: string, text: string): Promise<CardItem> {
    const raw = await apiRequest<any>(`/tasks/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Toggle checklist item completion status
   */
  async toggleChecklistItem(id: string, itemId: string, completed: boolean): Promise<CardItem> {
    const raw = await apiRequest<any>(`/tasks/${id}/checklist/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
    return normalizeBackendTask(raw);
  },

  /**
   * Automations persistence
   */
  async saveAutomation(rule: AutomationRule): Promise<void> {
    await apiRequest<void>('/automations', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async deleteAutomation(id: string): Promise<void> {
    await apiRequest<void>(`/automations/${id}`, {
      method: 'DELETE',
    });
  },
};
