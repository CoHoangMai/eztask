export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export type UserRoleLevel = 'admin' | 'manager' | 'member' | 'guest';

export interface WorkspaceMember {
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  allowedBoardIds?: string[]; // Specifically for 'guest' roles (Single or Multi-board guests)
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  ownerId: string;
  members: WorkspaceMember[];
  createdAt: string;
}

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role?: string; // Job title (e.g. Lead Architect, Product Designer)
  department?: string;
  workspaceIds?: string[]; // IDs of workspaces this user is part of
  teamIds?: string[];
  roleLevel?: UserRoleLevel;
}

export interface Team {
  id: string;
  workspaceId?: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  memberIds: string[];
  createdAt?: string;
}

export interface Label {
  id: string;
  workspaceId?: string;
  name: string;
  color: string;
  bg: string;
  text: string;
  border?: string;
  category?: string;
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
  boardId?: string;
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
  limit?: number;
  colorAccent?: string;
}

export interface Board {
  id: string;
  workspaceId: string; // Belongs to a specific isolated workspace/tenant
  title: string;
  description?: string;
  category: 'product' | 'marketing' | 'operations' | 'general' | 'design' | 'sales' | 'recruiting';
  visibility: 'workspace' | 'private';
  ownerId?: string;
  memberIds?: string[];
  teamId?: string;
  columns: Column[];
  cards: Record<string, CardItem>;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  workspaceId?: string;
  title: string;
  description: string;
  triggerEvent: 'checklist_completed' | 'card_moved' | 'due_date_reached' | 'card_created';
  actionSummary: string;
  enabled: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedLabels: string[];
  selectedAssignees: string[];
  selectedPriorities: Priority[];
  dueDateFilter: 'all' | 'today' | 'this_week' | 'overdue';
}

export interface AppNotification {
  id: string;
  recipientId: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  boardId?: string;
  taskId?: string;
  taskTitle?: string;
  eventType: string;
  message: string;
  read: boolean;
  createdAt: string;
}
