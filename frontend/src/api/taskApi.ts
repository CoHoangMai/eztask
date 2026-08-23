import { apiRequest } from './apiClient';
import type { Board, CardItem, Column, AutomationRule } from '../types/kanban';

/**
 * Task Management Service API (Spring Boot 3 + MongoDB via Spring Cloud Gateway /api/tasks/*)
 */
export const taskApi = {
  // ---------------------------------------------------------------------------
  // Board Operations
  // ---------------------------------------------------------------------------
  async getBoards(): Promise<Board[]> {
    return apiRequest<Board[]>('/tasks/boards', {
      method: 'GET',
    });
  },

  async getBoardById(id: string): Promise<Board> {
    return apiRequest<Board>(`/tasks/boards/${id}`, {
      method: 'GET',
    });
  },

  async createBoard(payload: { title: string; category: Board['category'] }): Promise<Board> {
    return apiRequest<Board>('/tasks/boards', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ---------------------------------------------------------------------------
  // Column Operations
  // ---------------------------------------------------------------------------
  async addColumn(boardId: string, title: string): Promise<Column> {
    return apiRequest<Column>(`/tasks/boards/${boardId}/columns`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async updateColumn(boardId: string, columnId: string, title: string): Promise<Column> {
    return apiRequest<Column>(`/tasks/boards/${boardId}/columns/${columnId}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  },

  async deleteColumn(boardId: string, columnId: string): Promise<void> {
    return apiRequest<void>(`/tasks/boards/${boardId}/columns/${columnId}`, {
      method: 'DELETE',
    });
  },

  // ---------------------------------------------------------------------------
  // Card Operations
  // ---------------------------------------------------------------------------
  async createCard(boardId: string, card: Omit<CardItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardItem> {
    return apiRequest<CardItem>(`/tasks/boards/${boardId}/cards`, {
      method: 'POST',
      body: JSON.stringify(card),
    });
  },

  async updateCard(card: CardItem): Promise<CardItem> {
    return apiRequest<CardItem>(`/tasks/cards/${card.id}`, {
      method: 'PUT',
      body: JSON.stringify(card),
    });
  },

  async moveCard(
    cardId: string, 
    sourceColId: string, 
    targetColId: string, 
    targetIndex?: number
  ): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/tasks/cards/${cardId}/move`, {
      method: 'POST',
      body: JSON.stringify({
        sourceColId,
        targetColId,
        targetIndex,
      }),
    });
  },

  async deleteCard(cardId: string): Promise<void> {
    return apiRequest<void>(`/tasks/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  // ---------------------------------------------------------------------------
  // Butler Automations
  // ---------------------------------------------------------------------------
  async getAutomations(): Promise<AutomationRule[]> {
    return apiRequest<AutomationRule[]>('/tasks/automations', {
      method: 'GET',
    });
  },

  async saveAutomation(rule: AutomationRule): Promise<AutomationRule> {
    return apiRequest<AutomationRule>('/tasks/automations', {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  },

  async deleteAutomation(ruleId: string): Promise<void> {
    return apiRequest<void>(`/tasks/automations/${ruleId}`, {
      method: 'DELETE',
    });
  }
};
