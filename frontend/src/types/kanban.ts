export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CardComment {
  id: string;
  author: Assignee;
  text: string;
  createdAt: string;
}

export interface CardAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
}

export interface CardItem {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  priority: Priority;
  labels: Label[];
  assignees: Assignee[];
  dueDate?: string;
  estimatedHours?: number;
  checklist: ChecklistItem[];
  comments: CardComment[];
  attachments?: CardAttachment[];
  coverColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
  limit?: number; // Optional WIP limit
  colorAccent?: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  category: 'product' | 'marketing' | 'operations' | 'general' | 'design';
  columns: Column[];
  cards: Record<string, CardItem>;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'kanban' | 'table' | 'calendar';

export interface FilterState {
  searchQuery: string;
  selectedLabels: string[];
  selectedAssignees: string[];
  selectedPriorities: Priority[];
  dueDateFilter: 'all' | 'today' | 'this_week' | 'overdue';
}

export interface AutomationRule {
  id: string;
  title: string;
  description: string;
  triggerEvent: 'card_created' | 'card_moved' | 'checklist_completed' | 'due_date_reached';
  actionSummary: string;
  enabled: boolean;
}
