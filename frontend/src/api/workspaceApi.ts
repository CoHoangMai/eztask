import { apiRequest } from './apiClient';
import type { Workspace, Team, WorkspaceRole } from '../types/kanban';

export interface CreateWorkspacePayload {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  logo?: string;
  description?: string;
}

export interface AddMemberPayload {
  userId: string;
  role: WorkspaceRole;
  allowedBoardIds?: string[];
}

export interface UpdateMemberRolePayload {
  role: WorkspaceRole;
  allowedBoardIds?: string[];
}

export interface CreateTeamPayload {
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  memberIds?: string[];
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  memberIds?: string[];
}

/**
 * Workspace and Team Management API
 * Communicates with Task Service via Spring Cloud Gateway (/api/workspaces/* and /api/teams/*)
 */
export const workspaceApi = {
  /**
   * Fetch all workspaces available for the authenticated user
   */
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const workspaces = await apiRequest<Workspace[]>('/workspaces', { method: 'GET' });
      return Array.isArray(workspaces) ? workspaces : [];
    } catch {
      return [];
    }
  },

  /**
   * Get specific workspace details
   */
  async getWorkspaceById(id: string): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${id}`, { method: 'GET' });
  },

  /**
   * Create a new workspace
   */
  async createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
    return apiRequest<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update workspace details
   */
  async updateWorkspace(id: string, payload: UpdateWorkspacePayload): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete workspace
   */
  async deleteWorkspace(id: string): Promise<void> {
    await apiRequest<void>(`/workspaces/${id}`, { method: 'DELETE' });
  },

  /**
   * Add a member to a workspace
   */
  async addMember(workspaceId: string, payload: AddMemberPayload): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update member role and board permissions
   */
  async updateMemberRole(workspaceId: string, userId: string, payload: UpdateMemberRolePayload): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Remove member from workspace
   */
  async removeMember(workspaceId: string, userId: string): Promise<Workspace> {
    return apiRequest<Workspace>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get teams in a workspace
   */
  async getTeams(workspaceId: string): Promise<Team[]> {
    try {
      const teams = await apiRequest<Team[]>(`/teams?workspaceId=${encodeURIComponent(workspaceId)}`, {
        method: 'GET',
      });
      return Array.isArray(teams) ? teams : [];
    } catch {
      return [];
    }
  },

  /**
   * Create team
   */
  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    return apiRequest<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update team
   */
  async updateTeam(id: string, payload: UpdateTeamPayload): Promise<Team> {
    return apiRequest<Team>(`/teams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete team
   */
  async deleteTeam(id: string): Promise<void> {
    await apiRequest<void>(`/teams/${id}`, { method: 'DELETE' });
  },

  /**
   * Add member to team
   */
  async addMemberToTeam(teamId: string, userId: string): Promise<Team> {
    return apiRequest<Team>(`/teams/${teamId}/members/${userId}`, { method: 'POST' });
  },

  /**
   * Remove member from team
   */
  async removeMemberFromTeam(teamId: string, userId: string): Promise<Team> {
    return apiRequest<Team>(`/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
  },
};
