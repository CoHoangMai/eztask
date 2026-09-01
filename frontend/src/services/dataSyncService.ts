import { isBackendAvailable, getAuthToken, removeAuthToken } from '../api';
import { authApi } from '../api/authApi';
import { taskApi } from '../api/taskApi';
import { workspaceApi } from '../api/workspaceApi';
import type { Workspace, Board, Team, CardItem, Assignee } from '../types/kanban';

export interface SyncStateResult {
  isBackendConnected: boolean;
  currentUser?: Assignee;
  workspaces?: Workspace[];
  boards?: Board[];
  teams?: Team[];
}

/**
 * Service to orchestrate Full-Stack End-to-End synchronization
 * between Frontend React state and Spring Boot Microservices via API Gateway.
 */
export class DataSyncService {
  /**
   * Check connection and fetch latest state from Backend Microservices
   */
  static async syncInitialData(activeWorkspaceId?: string): Promise<SyncStateResult> {
    const isOnline = await isBackendAvailable();
    if (!isOnline) {
      return { isBackendConnected: false };
    }

    const token = getAuthToken();
    if (!token) {
      // Backend is online, but user is not logged in yet
      return { isBackendConnected: true };
    }

    try {
      // 1. Fetch current profile
      let currentUser: Assignee | undefined;
      try {
        currentUser = await authApi.getProfile();
      } catch (e: any) {
        if (e?.message && (e.message.includes('401') || e.message.includes('Unauthorized'))) {
          // Invalid or expired token on backend - remove and exit cleanly
          removeAuthToken();
          return { isBackendConnected: true };
        }
      }

      // 2. Fetch all workspaces accessible to user
      let workspaces: Workspace[] = [];
      try {
        workspaces = await workspaceApi.getWorkspaces();
      } catch (e) {
        console.warn('[SyncService] Failed to fetch workspaces:', e);
      }
      
      const targetWorkspaceId = (activeWorkspaceId && workspaces.some(w => w.id === activeWorkspaceId))
        ? activeWorkspaceId
        : (workspaces.length > 0 ? workspaces[0].id : activeWorkspaceId);

      // 3. Fetch boards for target workspace or all boards
      let boards: Board[] = [];
      try {
        boards = await taskApi.getBoards(targetWorkspaceId);
      } catch (e) {
        console.warn('[SyncService] Failed to fetch boards:', e);
      }

      // 4. Fetch teams for target workspace
      let teams: Team[] = [];
      if (targetWorkspaceId) {
        try {
          teams = await workspaceApi.getTeams(targetWorkspaceId);
        } catch (e) {
          console.warn('[SyncService] Failed to fetch teams:', e);
        }
      }

      return {
        isBackendConnected: true,
        currentUser,
        workspaces: workspaces.length > 0 ? workspaces : undefined,
        boards: boards.length > 0 ? boards : undefined,
        teams: teams.length > 0 ? teams : undefined,
      };
    } catch (error) {
      console.error('[SyncService] Synchronization error:', error);
      return { isBackendConnected: true };
    }
  }

  /**
   * Optimistic Sync for Card Movement
   */
  static async syncCardMove(
    cardId: string, 
    sourceColId: string, 
    destColId: string, 
    destIndex?: number
  ): Promise<boolean> {
    try {
      await taskApi.moveCard(cardId, sourceColId, destColId, destIndex);
      return true;
    } catch (error) {
      console.warn('[SyncService] Failed to persist card move on backend:', error);
      return false;
    }
  }

  /**
   * Optimistic Sync for Card Creation
   */
  static async syncCardCreate(boardId: string, card: CardItem): Promise<boolean> {
    try {
      await taskApi.createCard(boardId, card);
      return true;
    } catch (error) {
      console.warn('[SyncService] Failed to persist card creation on backend:', error);
      return false;
    }
  }

  /**
   * Optimistic Sync for Card Update
   */
  static async syncCardUpdate(card: CardItem): Promise<boolean> {
    try {
      await taskApi.updateCard(card);
      return true;
    } catch (error) {
      console.warn('[SyncService] Failed to persist card update on backend:', error);
      return false;
    }
  }

  /**
   * Optimistic Sync for Card Deletion
   */
  static async syncCardDelete(cardId: string): Promise<boolean> {
    try {
      await taskApi.deleteCard(cardId);
      return true;
    } catch (error) {
      console.warn('[SyncService] Failed to persist card delete on backend:', error);
      return false;
    }
  }

  /**
   * Sync Workspace Creation
   */
  static async syncWorkspaceCreate(name: string, description: string, logo: string): Promise<Workspace | null> {
    try {
      return await workspaceApi.createWorkspace({
        name,
        description,
        logo,
      });
    } catch (error) {
      console.warn('[SyncService] Failed to persist workspace on backend:', error);
      return null;
    }
  }

  /**
   * Sync Team Creation
   */
  static async syncTeamCreate(workspaceId: string, name: string, description: string, color: string): Promise<Team | null> {
    try {
      return await workspaceApi.createTeam({
        workspaceId,
        name,
        description,
        color,
      });
    } catch (error) {
      console.warn('[SyncService] Failed to persist team on backend:', error);
      return null;
    }
  }
}
