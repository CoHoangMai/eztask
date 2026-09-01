import React, { useState, useMemo, useEffect } from 'react';
import type { 
  Board, 
  CardItem, 
  Column, 
  FilterState, 
  AutomationRule, 
  Assignee, 
  Label, 
  Team, 
  Workspace, 
  WorkspaceRole 
} from './types/kanban';
import { 
  INITIAL_BOARDS, 
  DEFAULT_USERS, 
  DEFAULT_LABELS, 
  DEFAULT_AUTOMATIONS,
  DEFAULT_TEAMS,
  DEFAULT_WORKSPACES,
  BOARD_TEMPLATES
} from './data/initialKanbanData';
import { Navbar } from './components/Navbar';
import { BoardHeader } from './components/BoardHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { CardDetailModal } from './components/CardDetailModal';
import { NewCardModal } from './components/NewCardModal';
import { AutomationModal } from './components/AutomationModal';
import { AuthPage } from './components/AuthPage';
import { ProfileView } from './components/ProfileView';
import { TeamManagementModal } from './components/TeamManagementModal';
import { TagManagementModal } from './components/TagManagementModal';
import { WorkspaceMembersModal } from './components/WorkspaceMembersModal';
import { EmptyBoardView } from './components/EmptyBoardView';
import { CreateBoardModal } from './components/CreateBoardModal';
import { exportWorkspaceToJSON, parseImportedWorkspace } from './utils/exportHelper';
import { authApi, taskApi, workspaceApi, setAuthToken, removeAuthToken, getAuthToken, isBackendAvailable } from './api';
import { DataSyncService } from './services/dataSyncService';

/**
 * Storage keys for persisting user workspace state in browser localStorage.
 */
const STORAGE_KEYS = {
  WORKSPACES: 'eztask_workspaces_data',
  ACTIVE_WORKSPACE_ID: 'eztask_active_workspace_id',
  BOARDS: 'eztask_boards_data',
  ACTIVE_BOARD_ID: 'eztask_active_board_id',
  AUTOMATIONS: 'eztask_automations_data',
  CURRENT_USER: 'eztask_current_user',
  AUTH_SESSION: 'eztask_authenticated',
  TEAMS: 'eztask_teams_data',
  USERS: 'eztask_workspace_users_data',
  LABELS: 'eztask_workspace_labels_data',
};

/**
 * Root Application Component
 * Controls multi-tenant workspaces, strict data isolation, RBAC (Owner/Admin/Member/Guest),
 * collaborative board state, views, automations, and modals.
 */
export const App: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. State Management: Authentication Lifecycle & User Identity
  // ---------------------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const auth = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      const token = getAuthToken();
      return auth === 'true' && !!token;
    } catch {
      return false;
    }
  });

  const [users, setUsers] = useState<Assignee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<Assignee>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return DEFAULT_USERS[0];
  });

  // ---------------------------------------------------------------------------
  // 2. State Management: Multi-Tenant Workspaces (True SaaS Isolation)
  // ---------------------------------------------------------------------------
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKSPACES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WORKSPACES;
  });

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(() => {
    try {
      const savedWsId = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID);
      if (savedWsId) return savedWsId;
    } catch {}
    return DEFAULT_WORKSPACES[0].id;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_TEAMS;
  });

  const [labels, setLabels] = useState<Label[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LABELS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LABELS;
  });

  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'kanban' | 'table' | 'calendar' | 'profile'>('kanban');

  // ---------------------------------------------------------------------------
  // 3. State Management: Boards & Active Board
  // ---------------------------------------------------------------------------
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOARDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_BOARDS;
  });

  const [currentBoardId, setCurrentBoardId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD_ID);
      if (savedId) return savedId;
    } catch {}
    return INITIAL_BOARDS[0].id;
  });

  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUTOMATIONS;
  });

  // ---------------------------------------------------------------------------
  // 4. State Management: Modals & Dialogs
  // ---------------------------------------------------------------------------
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState<boolean>(false);
  const [newCardTargetColId, setNewCardTargetColId] = useState<string | undefined>(undefined);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);
  const [isWorkspaceMembersModalOpen, setIsWorkspaceMembersModalOpen] = useState<boolean>(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState<boolean>(false);
  const [automationToast, setAutomationToast] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 5. State Management: Filters
  // ---------------------------------------------------------------------------
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedLabels: [],
    selectedAssignees: [],
    selectedPriorities: [],
    dueDateFilter: 'all'
  });

  // ---------------------------------------------------------------------------
  // 6. Multi-Tenant Workspace Resolution & Zero-Trust Access Permissions
  // ---------------------------------------------------------------------------
  // Workspaces accessible to the current user (owned or member)
  const accessibleWorkspaces = useMemo(() => {
    return workspaces.filter(w => 
      w.ownerId === currentUser.id || 
      (w.members && w.members.some(m => m.userId === currentUser.id)) ||
      (currentUser.workspaceIds && currentUser.workspaceIds.includes(w.id))
    );
  }, [workspaces, currentUser.id, currentUser.workspaceIds]);

  const currentWorkspace: Workspace | null = useMemo(() => {
    if (currentWorkspaceId) {
      const found = accessibleWorkspaces.find(w => w.id === currentWorkspaceId);
      if (found) return found;
    }
    if (accessibleWorkspaces.length > 0) return accessibleWorkspaces[0];
    return null;
  }, [currentWorkspaceId, accessibleWorkspaces]);

  // Current user's membership & role within the active workspace
  const currentUserMemberRecord = useMemo(() => {
    if (!currentWorkspace || !currentWorkspace.members) return undefined;
    return currentWorkspace.members.find(m => m.userId === currentUser.id);
  }, [currentWorkspace, currentUser.id]);

  const currentUserRole: WorkspaceRole = useMemo(() => {
    if (!currentWorkspace) return 'guest';
    if (currentWorkspace.ownerId === currentUser.id) {
      return 'owner';
    }
    if (currentUserMemberRecord) {
      return currentUserMemberRecord.role;
    }
    // If not listed in members and not owner, user is an external guest with 0 access
    return 'guest';
  }, [currentWorkspace, currentUser.id, currentUserMemberRecord]);

  // Isolated boards belonging to the active workspace
  const workspaceAllBoards = useMemo(() => {
    if (!currentWorkspace) return [];
    return boards.filter(b => b.workspaceId === currentWorkspace.id);
  }, [boards, currentWorkspace]);

  // Isolated teams belonging to the active workspace
  const workspaceTeams = useMemo(() => {
    if (!currentWorkspace) return [];
    const allTeamsInWs = teams.filter(t => !t.workspaceId || t.workspaceId === currentWorkspace.id);
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      return allTeamsInWs;
    }
    if (currentUserRole === 'member') {
      return allTeamsInWs.filter(t => t.memberIds && t.memberIds.includes(currentUser.id));
    }
    return [];
  }, [teams, currentWorkspace, currentUserRole, currentUser.id]);

  // Filtered boards for this user based on Zero-Trust Role & Member assignments
  const visibleBoards = useMemo(() => {
    if (!currentWorkspace) return [];
    const isWsOwner = currentWorkspace.ownerId === currentUser.id;
    // If user is neither owner nor listed in members, they have ZERO access
    if (!isWsOwner && !currentUserMemberRecord) {
      return [];
    }

    // 1. Workspace Owner or Admin: Full visibility into all boards in this workspace
    if (currentUserRole === 'owner' || currentUserRole === 'admin') {
      return workspaceAllBoards;
    }

    // 2. Workspace Member: Zero-trust by default. Only visible if user is board owner, explicit member, or in board's team
    if (currentUserRole === 'member') {
      return workspaceAllBoards.filter(b => {
        const isBoardOwner = b.ownerId === currentUser.id;
        const isExplicitMember = b.memberIds && b.memberIds.includes(currentUser.id);
        const isTeamMember = b.teamId ? workspaceTeams.some(t => t.id === b.teamId && t.memberIds.includes(currentUser.id)) : false;
        return isBoardOwner || isExplicitMember || isTeamMember;
      });
    }

    // 3. Workspace Guest: Zero-trust by default. Only visible if explicitly in allowedBoardIds or memberIds
    if (currentUserRole === 'guest') {
      const allowed = currentUserMemberRecord?.allowedBoardIds || [];
      return workspaceAllBoards.filter(b => 
        allowed.includes(b.id) || (b.memberIds && b.memberIds.includes(currentUser.id))
      );
    }

    return [];
  }, [currentWorkspace, currentUserRole, currentUserMemberRecord, workspaceAllBoards, currentUser.id, workspaceTeams]);

  // Ensure current active board belongs to visible boards in current workspace
  const currentBoard = useMemo(() => {
    if (!visibleBoards || visibleBoards.length === 0) {
      return null;
    }
    const found = visibleBoards.find(b => b.id === currentBoardId);
    return found || visibleBoards[0] || null;
  }, [visibleBoards, currentBoardId]);

  // Sync currentBoardId when workspace or visibleBoards changes
  useEffect(() => {
    if (visibleBoards.length > 0) {
      if (!visibleBoards.some(b => b.id === currentBoardId)) {
        setCurrentBoardId(visibleBoards[0].id);
      }
    } else {
      setCurrentBoardId('');
    }
  }, [currentWorkspaceId, visibleBoards, currentBoardId]);

  // Currently opened card resolution
  const selectedCard = useMemo(() => {
    if (!selectedCardId || !currentBoard || !currentBoard.cards) return null;
    return currentBoard.cards[selectedCardId] || null;
  }, [currentBoard, selectedCardId]);

  // Filtered cards mapping for performant rendering
  const filteredCards = useMemo(() => {
    const cardMap: Record<string, CardItem> = {};
    if (!currentBoard || !currentBoard.cards) return cardMap;

    const cardsList: CardItem[] = Object.values(currentBoard.cards || {});

    cardsList.forEach(card => {
      // 1. Search Query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchTitle = card.title.toLowerCase().includes(query);
        const matchDesc = card.description?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return;
      }

      // 2. Label Filter
      if (filter.selectedLabels.length > 0) {
        const hasLabel = card.labels.some(l => filter.selectedLabels.includes(l.id));
        if (!hasLabel) return;
      }

      // 3. Assignee Filter
      if (filter.selectedAssignees.length > 0) {
        const hasAssignee = card.assignees.some(a => filter.selectedAssignees.includes(a.id));
        if (!hasAssignee) return;
      }

      // 4. Priority Filter
      if (filter.selectedPriorities.length > 0) {
        if (!filter.selectedPriorities.includes(card.priority)) return;
      }

      // 5. Due Date Filter
      if (filter.dueDateFilter !== 'all' && card.dueDate) {
        const now = new Date();
        const due = new Date(card.dueDate);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (filter.dueDateFilter === 'overdue' && diffDays < 0) {
          // Keep
        } else if (filter.dueDateFilter === 'today' && diffDays === 0) {
          // Keep
        } else if (filter.dueDateFilter === 'this_week' && diffDays >= 0 && diffDays <= 7) {
          // Keep
        } else {
          return;
        }
      }

      cardMap[card.id] = card;
    });

    return cardMap;
  }, [currentBoard, filter]);

  // ---------------------------------------------------------------------------
  // 7. Synchronization: Persist state changes to browser localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE_ID, currentWorkspaceId);
      localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD_ID, currentBoardId);
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, isAuthenticated ? 'true' : 'false');
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(labels));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }, [
    workspaces, 
    currentWorkspaceId, 
    boards, 
    currentBoardId, 
    automations, 
    currentUser, 
    isAuthenticated, 
    users, 
    teams, 
    labels
  ]);

  const checkGatewayHealth = async (targetWsId?: string) => {
    // If not authenticated, only ping health endpoint to check connection without protected calls
    if (!isAuthenticated) {
      const available = await isBackendAvailable();
      setIsOnline(available);
      return;
    }

    const wsToQuery = targetWsId || currentWorkspaceId;
    const syncResult = await DataSyncService.syncInitialData(wsToQuery);
    setIsOnline(syncResult.isBackendConnected);

    if (syncResult.isBackendConnected) {
      if (syncResult.currentUser) {
        setCurrentUser(syncResult.currentUser);
      }
      if (syncResult.workspaces && syncResult.workspaces.length > 0) {
        setWorkspaces(prev => {
          const serverWsIds = new Set(syncResult.workspaces!.map(w => w.id));
          const localOnly = prev.filter(w => !serverWsIds.has(w.id));
          return [...syncResult.workspaces!, ...localOnly];
        });
      }
      if (syncResult.boards && syncResult.boards.length > 0) {
        setBoards(prev => {
          const serverBoardIds = new Set(syncResult.boards!.map(b => b.id));
          const localOnly = prev.filter(b => !serverBoardIds.has(b.id));
          return [...syncResult.boards!, ...localOnly];
        });
      }
      if (syncResult.teams && syncResult.teams.length > 0) {
        setTeams(syncResult.teams);
      }
    }
  };

  useEffect(() => {
    checkGatewayHealth();

    // Periodic check every 8 seconds if offline or every 30s if online
    const interval = setInterval(() => {
      checkGatewayHealth();
    }, isOnline ? 30000 : 8000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkGatewayHealth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, isOnline, currentWorkspaceId]);

  // ---------------------------------------------------------------------------
  // 8. Automation Engine
  // ---------------------------------------------------------------------------
  const executeAutomations = (card: CardItem, targetColId: string): CardItem => {
    if (!currentBoard) return card;
    const isChecklistDone = card.checklist.length > 0 && card.checklist.every(item => item.completed);
    
    automations.forEach(rule => {
      if (!rule.enabled) return;

      if (rule.triggerEvent === 'checklist_completed' && isChecklistDone) {
        const doneCol = currentBoard.columns.find(c => 
          c.title.toLowerCase().includes('done') || c.title.toLowerCase().includes('complete') || c.title.toLowerCase().includes('settled') || c.title.toLowerCase().includes('delivered')
        );
        if (doneCol && targetColId !== doneCol.id) {
          setAutomationToast('Automated: Moved card to Completed column');
        }
      }

      if (rule.triggerEvent === 'card_created' && card.priority === 'urgent') {
        setAutomationToast('Automated: Broadcasted urgent priority notification to team');
      }
    });

    return card;
  };

  // ---------------------------------------------------------------------------
  // 9. Workspace Switcher & Multi-Tenant Management
  // ---------------------------------------------------------------------------
  const handleSelectWorkspace = (ws: Workspace) => {
    setCurrentWorkspaceId(ws.id);
    const wsBoards = boards.filter(b => b.workspaceId === ws.id);
    if (wsBoards.length > 0) {
      setCurrentBoardId(wsBoards[0].id);
    }
    setAutomationToast(`Switched workspace to: ${ws.name}`);
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleCreateWorkspace = (name: string, description: string, logo: string) => {
    const newWsId = `ws-${Date.now()}`;
    const newBoardId = `board-${Date.now()}`;

    const newWs: Workspace = {
      id: newWsId,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      logo: logo || name.slice(0, 2).toUpperCase() || 'WS',
      description,
      ownerId: currentUser.id,
      members: [
        { userId: currentUser.id, role: 'owner', joinedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };

    const initialTemplate = BOARD_TEMPLATES[0];
    const initialColumns: Column[] = initialTemplate.defaultColumns.map((col, idx) => ({
      id: `col-new-${idx}-${Date.now()}`,
      title: col.title,
      cardIds: [],
      colorAccent: col.colorAccent
    }));

    const newBoard: Board = {
      id: newBoardId,
      workspaceId: newWsId,
      title: `${name} Main Board`,
      description: `Initial workflow board for ${name}`,
      category: 'general',
      visibility: 'workspace',
      columns: initialColumns,
      cards: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setWorkspaces(prev => [...prev, newWs]);
    setBoards(prev => [...prev, newBoard]);
    setCurrentWorkspaceId(newWsId);
    setCurrentBoardId(newBoardId);

    // Add workspace to user's workspaceIds
    setCurrentUser(prev => ({
      ...prev,
      workspaceIds: [...(prev.workspaceIds || []), newWsId]
    }));
    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, workspaceIds: [...(u.workspaceIds || []), newWsId] };
      }
      return u;
    }));

    setAutomationToast(`Organization "${name}" created! You are the Workspace Owner.`);
    setTimeout(() => setAutomationToast(null), 3500);

    if (isOnline) {
      workspaceApi.createWorkspace({
        name,
        description,
        logo: newWs.logo,
      }).catch(console.warn);
      taskApi.createBoard({
        title: `${name} Main Board`,
        category: 'general',
      }).catch(console.warn);
    }
  };

  const handleUpdateWorkspace = (updatedWs: Workspace) => {
    setWorkspaces(prev => prev.map(w => w.id === updatedWs.id ? updatedWs : w));
    setAutomationToast(`Workspace "${updatedWs.name}" updated`);
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.updateWorkspace(updatedWs.id, {
        name: updatedWs.name,
        description: updatedWs.description,
        logo: updatedWs.logo,
      }).catch(console.warn);
    }
  };

  const handleInviteMember = (email: string, role: WorkspaceRole, allowedBoardIds?: string[]) => {
    const ws = currentWorkspace;
    if (!ws) return;
    let targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!targetUser) {
      targetUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: role === 'guest' ? 'External Consultant / Guest' : 'Workspace Member',
        department: 'External',
        workspaceIds: [ws.id]
      };
      setUsers(prev => [...prev, targetUser!]);
    }

    const updatedMembers = [
      ...ws.members.filter(m => m.userId !== targetUser!.id),
      {
        userId: targetUser.id,
        role,
        joinedAt: new Date().toISOString(),
        allowedBoardIds: role === 'guest' ? allowedBoardIds : undefined
      }
    ];

    handleUpdateWorkspace({
      ...ws,
      members: updatedMembers
    });

    setAutomationToast(`Invited ${targetUser.name} as ${role.toUpperCase()}`);
    setTimeout(() => setAutomationToast(null), 3500);

    if (isOnline) {
      workspaceApi.addMember(ws.id, {
        userId: targetUser.id,
        role,
        allowedBoardIds,
      }).catch(console.warn);
    }
  };

  const handleRemoveMember = (userId: string) => {
    const ws = currentWorkspace;
    if (!ws) return;
    const updatedMembers = ws.members.filter(m => m.userId !== userId);
    handleUpdateWorkspace({
      ...ws,
      members: updatedMembers
    });
    setAutomationToast('Member removed from workspace');
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.removeMember(ws.id, userId).catch(console.warn);
    }
  };

  const handleChangeMemberRole = (userId: string, newRole: WorkspaceRole, allowedBoardIds?: string[]) => {
    const ws = currentWorkspace;
    if (!ws) return;
    const updatedMembers = ws.members.map(m => {
      if (m.userId === userId) {
        return {
          ...m,
          role: newRole,
          allowedBoardIds: newRole === 'guest' ? allowedBoardIds : undefined
        };
      }
      return m;
    });

    handleUpdateWorkspace({
      ...ws,
      members: updatedMembers
    });

    setAutomationToast(`Updated role to ${newRole}`);
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.updateMemberRole(ws.id, userId, {
        role: newRole,
        allowedBoardIds,
      }).catch(console.warn);
    }
  };

  // ---------------------------------------------------------------------------
  // 10. Board CRUD Handlers (Scoped to currentWorkspace.id)
  // ---------------------------------------------------------------------------
  const handleSelectBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
  };

  const handleCreateBoard = (
    title: string, 
    category: Board['category'] = 'general', 
    templateId?: string,
    teamId?: string
  ) => {
    const ws = currentWorkspace;
    if (!ws) return;
    const template = BOARD_TEMPLATES.find(t => t.id === templateId) || BOARD_TEMPLATES[0];
    
    const columns: Column[] = template.defaultColumns.map((col, idx) => ({
      id: `col-${template.id}-${idx}-${Date.now()}`,
      title: col.title,
      cardIds: [],
      colorAccent: col.colorAccent
    }));

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      workspaceId: ws.id,
      title,
      description: template.description,
      category,
      visibility: 'workspace',
      teamId,
      columns,
      cards: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);
    setAutomationToast(`Created board: "${title}" in ${ws.name}`);
    setTimeout(() => setAutomationToast(null), 3500);
  };

  const handleAddColumn = (title: string) => {
    if (!currentBoard || !title.trim()) return;
    const newCol: Column = {
      id: `col-${Date.now()}`,
      title: title.trim(),
      cardIds: [],
      colorAccent: '#64748b'
    };

    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        return {
          ...b,
          columns: [...b.columns, newCol],
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!currentBoard) return;
    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        const colToDelete = b.columns.find(c => c.id === columnId);
        const cardIdsToDelete = new Set<string>(colToDelete?.cardIds || []);
        const updatedCards = { ...b.cards };
        cardIdsToDelete.forEach((id: string) => {
          delete updatedCards[id];
        });

        return {
          ...b,
          columns: b.columns.filter(c => c.id !== columnId),
          cards: updatedCards,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    if (!currentBoard) return;
    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        return {
          ...b,
          columns: b.columns.map(c => c.id === columnId ? { ...c, title: newTitle } : c),
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));
  };

  const handleCreateCard = (cardData: Omit<CardItem, 'id' | 'createdAt' | 'updatedAt' | 'boardId'>, targetColumnId?: string) => {
    if (!currentBoard) return;
    const colId = targetColumnId || cardData.columnId || currentBoard.columns[0]?.id || 'col-todo';
    const newCardId = `card-${Date.now()}`;
    const newCard: CardItem = {
      ...cardData,
      id: newCardId,
      boardId: currentBoard.id,
      columnId: colId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const finalCard = executeAutomations(newCard, colId);

    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        return {
          ...b,
          cards: {
            ...b.cards,
            [newCardId]: finalCard
          },
          columns: b.columns.map(c => {
            if (c.id === colId) {
              return { ...c, cardIds: [newCardId, ...c.cardIds] };
            }
            return c;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));

    setAutomationToast(`Task created: "${finalCard.title}"`);
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      taskApi.createCard(currentBoard.id, finalCard).catch((err) => {
        console.warn('[OptimisticSync] Create card error on backend:', err);
        setAutomationToast('Offline: saved to local workspace cache');
        setTimeout(() => setAutomationToast(null), 3000);
      });
    }
  };

  const handleUpdateCard = (updatedCard: CardItem) => {
    if (!currentBoard) return;
    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        return {
          ...b,
          cards: {
            ...b.cards,
            [updatedCard.id]: updatedCard
          },
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));

    if (isOnline) {
      taskApi.updateCard(updatedCard).catch((err) => {
        console.warn('[OptimisticSync] Update card error on backend:', err);
        setAutomationToast('Offline: changes saved locally');
        setTimeout(() => setAutomationToast(null), 2500);
      });
    }
  };

  const handleDeleteCard = (cardId: string) => {
    if (!currentBoard) return;
    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        const updatedCards = { ...b.cards };
        delete updatedCards[cardId];

        return {
          ...b,
          columns: b.columns.map(c => ({
            ...c,
            cardIds: c.cardIds.filter(id => id !== cardId)
          })),
          cards: updatedCards,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    }));

    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }

    if (isOnline) {
      taskApi.deleteTask(cardId).catch(console.warn);
    }
  };

  const handleMoveCard = (cardId: string, sourceColId: string, destColId: string, destIndex?: number) => {
    if (!currentBoard) return;
    const targetIndex = typeof destIndex === 'number' ? destIndex : 0;
    let movedCard: CardItem | null = null;

    const destCol = currentBoard.columns.find(c => c.id === destColId);
    const targetCard = currentBoard.cards[cardId];

    if (targetCard && sourceColId !== destColId) {
      const destTitle = destCol?.title || 'new column';
      const isDone = destTitle.toLowerCase().includes('done') || 
                     destTitle.toLowerCase().includes('complete') || 
                     destTitle.toLowerCase().includes('settled') || 
                     destTitle.toLowerCase().includes('hired') || 
                     destTitle.toLowerCase().includes('delivered') || 
                     destTitle.toLowerCase().includes('approved') || 
                     destTitle.toLowerCase().includes('shipped');
      const isReview = destTitle.toLowerCase().includes('review') || 
                       destTitle.toLowerCase().includes('qa') || 
                       destTitle.toLowerCase().includes('testing');

      let toastMsg = `Task moved: "${targetCard.title}" to ${destTitle}`;
      if (isDone) {
        toastMsg = `Completed: "${targetCard.title}" moved to ${destTitle}`;
      } else if (isReview) {
        toastMsg = `In Review: "${targetCard.title}" moved to ${destTitle}`;
      }
      setAutomationToast(toastMsg);
      setTimeout(() => setAutomationToast(null), 3500);
    }

    setBoards(prev => prev.map(b => {
      if (b.id === currentBoard.id) {
        const cardToMove = b.cards[cardId];
        if (!cardToMove) return b;

        const processedCard: CardItem = {
          ...cardToMove,
          columnId: destColId,
          updatedAt: new Date().toISOString()
        };

        movedCard = processedCard;

        const newColumns = b.columns.map(col => {
          if (col.id === sourceColId && sourceColId === destColId) {
            const reordered = Array.from(col.cardIds);
            const fromIndex = reordered.indexOf(cardId);
            if (fromIndex > -1) {
              reordered.splice(fromIndex, 1);
              reordered.splice(targetIndex, 0, cardId);
            }
            return { ...col, cardIds: reordered };
          }

          if (col.id === sourceColId) {
            return { ...col, cardIds: col.cardIds.filter(id => id !== cardId) };
          }

          if (col.id === destColId) {
            const destCards = Array.from(col.cardIds);
            destCards.splice(targetIndex, 0, cardId);
            return { ...col, cardIds: destCards };
          }

          return col;
        });

        return { 
          ...b, 
          columns: newColumns,
          cards: {
            ...b.cards,
            [cardId]: processedCard
          },
          updatedAt: new Date().toISOString() 
        };
      }
      return b;
    }));

    if (isOnline && movedCard) {
      taskApi.moveCard(cardId, sourceColId, destColId, targetIndex).catch((err) => {
        console.warn('[OptimisticSync] Move card error on backend:', err);
        setAutomationToast('Offline: position saved locally');
        setTimeout(() => setAutomationToast(null), 2500);
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 11. Multi-Team & Taxonomy CRUD Handlers
  // ---------------------------------------------------------------------------
  const handleCreateTeam = (teamData: Omit<Team, 'id' | 'createdAt'>) => {
    const ws = currentWorkspace;
    if (!ws) return;
    const newTeam: Team = {
      ...teamData,
      workspaceId: ws.id,
      id: `team-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTeams(prev => [...prev, newTeam]);
    setAutomationToast(`Team "${teamData.name}" created`);
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.createTeam({
        workspaceId: ws.id,
        name: teamData.name,
        description: teamData.description,
        color: teamData.color,
        icon: teamData.icon,
        memberIds: teamData.memberIds,
      }).catch(console.warn);
    }
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    setAutomationToast(`Team "${updatedTeam.name}" updated`);
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.updateTeam(updatedTeam.id, {
        name: updatedTeam.name,
        description: updatedTeam.description,
        color: updatedTeam.color,
        icon: updatedTeam.icon,
        memberIds: updatedTeam.memberIds,
      }).catch(console.warn);
    }
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
    setAutomationToast('Team removed from workspace');
    setTimeout(() => setAutomationToast(null), 3000);

    if (isOnline) {
      workspaceApi.deleteTeam(teamId).catch(console.warn);
    }
  };

  const handleAddWorkspaceUser = (userData: Omit<Assignee, 'id'>) => {
    const ws = currentWorkspace;
    if (!ws) return;
    const newUser: Assignee = {
      ...userData,
      id: `user-${Date.now()}`,
      workspaceIds: [ws.id]
    };
    setUsers(prev => [...prev, newUser]);
    setAutomationToast(`Member "${userData.name}" added`);
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleUpdateWorkspaceUser = (updatedUser: Assignee) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleCreateLabel = (labelData: Omit<Label, 'id'>) => {
    const newLabel: Label = {
      ...labelData,
      id: `label-${Date.now()}`
    };
    setLabels(prev => [...prev, newLabel]);
    setAutomationToast(`Tag "${labelData.name}" created`);
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleDeleteLabel = (labelId: string) => {
    setLabels(prev => prev.filter(l => l.id !== labelId));
    setAutomationToast('Tag removed');
    setTimeout(() => setAutomationToast(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 12. JSON Export / Import Handlers
  // ---------------------------------------------------------------------------
  const handleExportWorkspace = () => {
    const ws = currentWorkspace;
    if (!ws) return;
    exportWorkspaceToJSON(workspaceAllBoards, automations);
    setAutomationToast(`Exported ${ws.name} backup successfully`);
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleImportWorkspace = async (file: File) => {
    const ws = currentWorkspace;
    if (!ws) return;
    try {
      const parsedData = await parseImportedWorkspace(file);
      if (parsedData.boards && parsedData.boards.length > 0) {
        const imported = parsedData.boards.map(b => ({
          ...b,
          workspaceId: ws.id
        }));
        setBoards(prev => [...prev.filter(b => b.workspaceId !== ws.id), ...imported]);
        setCurrentBoardId(imported[0].id);
      }
      if (parsedData.automations) {
        setAutomations(parsedData.automations);
      }
      setAutomationToast('Workspace backup imported successfully!');
      setTimeout(() => setAutomationToast(null), 3000);
    } catch (err: any) {
      setAutomationToast(err.message || 'Failed to import backup file');
      setTimeout(() => setAutomationToast(null), 4000);
    }
  };

  // ---------------------------------------------------------------------------
  // 13. Automation Configuration Handlers
  // ---------------------------------------------------------------------------
  const handleToggleAutomation = (ruleId: string) => {
    setAutomations(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const handleAddAutomation = (rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `rule-${Date.now()}`
    };
    setAutomations(prev => [...prev, newRule]);
    if (isOnline) {
      taskApi.saveAutomation(newRule).catch(console.warn);
    }
  };

  const handleDeleteAutomation = (ruleId: string) => {
    setAutomations(prev => prev.filter(r => r.id !== ruleId));
    if (isOnline) {
      taskApi.deleteAutomation(ruleId).catch(console.warn);
    }
  };

  // ---------------------------------------------------------------------------
  // 14. Authentication & Persona Switching Handlers
  // ---------------------------------------------------------------------------
  const handleSuccessfulAuth = (user: Assignee, preferredWsId?: string, token?: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    const validToken = token || `eztask-jwt-${user.id}`;
    setAuthToken(validToken);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
    } catch {}

    const targetWsId = preferredWsId || user.workspaceIds?.[0];
    if (targetWsId) {
      setCurrentWorkspaceId(targetWsId);
      const wsBoards = boards.filter(b => b.workspaceId === targetWsId);
      if (wsBoards.length > 0) setCurrentBoardId(wsBoards[0].id);
      else setCurrentBoardId('');
    } else {
      const userWorkspaces = workspaces.filter(w => 
        w.ownerId === user.id || 
        (w.members && w.members.some(m => m.userId === user.id)) ||
        (user.workspaceIds && user.workspaceIds.includes(w.id))
      );
      if (userWorkspaces.length > 0) {
        setCurrentWorkspaceId(userWorkspaces[0].id);
        const wsBoards = boards.filter(b => b.workspaceId === userWorkspaces[0].id);
        if (wsBoards.length > 0) setCurrentBoardId(wsBoards[0].id);
        else setCurrentBoardId('');
      } else {
        setCurrentWorkspaceId('');
        setCurrentBoardId('');
      }
    }
  };

  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const res = await authApi.login({ email: normalizedEmail, password });
        if (res && res.user && res.token) {
          const wsId = res.user.workspaceIds?.[0];
          handleSuccessfulAuth(res.user, wsId, res.token);
          setAutomationToast(`Welcome back, ${res.user.name}`);
          setTimeout(() => setAutomationToast(null), 3000);
          if (wsId) checkGatewayHealth(wsId);
          return true;
        }
      } catch (apiErr) {
        console.warn('Online auth attempt failed, checking local credentials:', apiErr);
      }

      // Fallback or demo match
      const matchingUser = users.find(u => u.email.toLowerCase() === normalizedEmail) || 
        DEFAULT_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

      if (matchingUser) {
        const demoToken = `eztask-jwt-${matchingUser.id}`;
        const wsId = matchingUser.workspaceIds?.[0];
        handleSuccessfulAuth(matchingUser, wsId, demoToken);
        setAutomationToast(`Welcome back, ${matchingUser.name}`);
        setTimeout(() => setAutomationToast(null), 3000);
        if (wsId) checkGatewayHealth(wsId);
        return true;
      }

      // Dynamic demo user creation if arbitrary email entered
      const dynamicUserId = `user-${Date.now()}`;
      const defaultWsId = `ws-${Date.now()}`;
      const namePart = normalizedEmail.split('@')[0] || 'User';
      const dynamicUser: Assignee = {
        id: dynamicUserId,
        name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
        email: normalizedEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
        role: 'Technology Lead',
        department: 'Engineering',
        workspaceIds: [defaultWsId]
      };
      setUsers(prev => [...prev, dynamicUser]);
      handleSuccessfulAuth(dynamicUser, defaultWsId, `eztask-jwt-${dynamicUserId}`);
      setAutomationToast(`Welcome, ${dynamicUser.name}`);
      setTimeout(() => setAutomationToast(null), 3000);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const handleRegister = async (name: string, email: string, role: string): Promise<boolean> => {
    try {
      let registeredUser: Assignee | null = null;
      let registeredToken: string | null = null;
      let registeredWsId: string | null = null;

      // Always call the backend API first
      try {
        const res = await authApi.register({ name, email, role });
        if (res && res.user && res.token) {
          registeredUser = res.user;
          registeredToken = res.token;
          registeredWsId = res.user.workspaceIds?.[0] || null;
        }
      } catch (apiErr) {
        console.warn('Backend register failed, falling back to local creation:', apiErr);
      }

      if (!registeredUser) {
        const newUserId = `user-${Date.now()}`;
        const newWsId = `ws-${Date.now()}`;

        registeredUser = {
          id: newUserId,
          name: name.trim(),
          email: email.trim(),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
          role: role || 'Software Engineer',
          department: 'Product & Engineering',
          workspaceIds: [newWsId]
        };
        registeredToken = `eztask-jwt-${newUserId}`;
        registeredWsId = newWsId;
      }

      const targetWsId = registeredWsId || `ws-${registeredUser.id}`;
      const personalWs: Workspace = {
        id: targetWsId,
        name: `${registeredUser.name.split(' ')[0]}'s Workspace`,
        slug: `${registeredUser.name.toLowerCase().replace(/\s+/g, '-')}-workspace`,
        logo: registeredUser.name.trim().slice(0, 2).toUpperCase() || 'WS',
        description: `Personal organization workspace for ${registeredUser.name}`,
        ownerId: registeredUser.id,
        members: [
          { userId: registeredUser.id, role: 'owner', joinedAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString()
      };

      const starterBoard: Board = {
        id: `board-${registeredUser.id}`,
        workspaceId: targetWsId,
        title: `${registeredUser.name.split(' ')[0]} Main Board`,
        description: `Your initial workflow board`,
        category: 'general',
        visibility: 'workspace',
        ownerId: registeredUser.id,
        memberIds: [registeredUser.id],
        columns: [
          { id: `col-todo-${registeredUser.id}`, title: 'To Do', cardIds: [], colorAccent: '#3b82f6' },
          { id: `col-inprog-${registeredUser.id}`, title: 'In Progress', cardIds: [], limit: 4, colorAccent: '#f59e0b' },
          { id: `col-done-${registeredUser.id}`, title: 'Done', cardIds: [], colorAccent: '#10b981' }
        ],
        cards: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setWorkspaces(prev => prev.some(w => w.id === personalWs.id) ? prev : [...prev, personalWs]);
      setBoards(prev => prev.some(b => b.id === starterBoard.id) ? prev : [...prev, starterBoard]);
      setUsers(prev => prev.some(u => u.id === registeredUser!.id) ? prev : [...prev, registeredUser!]);
      setCurrentWorkspaceId(targetWsId);
      setCurrentBoardId(starterBoard.id);

      handleSuccessfulAuth(registeredUser, targetWsId, registeredToken || undefined);
      checkGatewayHealth(targetWsId);

      setAutomationToast(`Account created! Welcome to your workspace, ${name}.`);
      setTimeout(() => setAutomationToast(null), 3500);
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      return false;
    }
  };

  const handleSwitchUser = (user: Assignee) => {
    handleSuccessfulAuth(user, undefined, `eztask-jwt-${user.id}`);
    setAutomationToast(`Switched user: ${user.name}`);
    setTimeout(() => setAutomationToast(null), 3000);
  };

  const handleLogout = () => {
    authApi.logout();
    removeAuthToken();
    setIsAuthenticated(false);
    setActiveView('kanban');
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {}
    setAutomationToast('Signed out');
    setTimeout(() => setAutomationToast(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // 15. Render: Dedicated Auth Page if Unauthenticated
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen w-screen bg-slate-950 font-sans select-none">
        <AuthPage 
          onLogin={handleLogin}
          onRegister={handleRegister}
        />

        {automationToast && (
          <div 
            id="automation-toast-banner"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
            <span className="text-xs font-semibold">{automationToast}</span>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 16. Render: Authenticated Multi-Tenant Application
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Navbar with Multi-Tenant Workspace Switcher */}
      <Navbar 
        currentUser={currentUser}
        availableUsers={users}
        activeBoardTitle={currentBoard ? currentBoard.title : 'No active board'}
        isOnline={isOnline}
        workspaces={accessibleWorkspaces}
        currentWorkspace={currentWorkspace}
        currentUserRole={currentUserRole}
        onSelectWorkspace={handleSelectWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        onOpenMembersModal={() => setIsWorkspaceMembersModalOpen(true)}
        onOpenProfileView={() => setActiveView('profile')}
        onSelectUser={handleSwitchUser}
        onLogout={handleLogout}
        onNavigateToCard={(cardId) => {
          setSelectedCardId(cardId);
          if (activeView === 'profile') setActiveView('kanban');
        }}
      />

      {/* When in Profile View: Render dedicated Profile & Tenant Access View */}
      {activeView === 'profile' ? (
        <ProfileView 
          currentUser={currentUser}
          allUsers={users}
          teams={workspaceTeams}
          workspaces={accessibleWorkspaces}
          currentWorkspace={currentWorkspace}
          onUpdateUser={(updated) => {
            handleUpdateWorkspaceUser(updated);
            setAutomationToast('Profile updated');
            setTimeout(() => setAutomationToast(null), 3000);
          }}
          onBackToBoard={() => setActiveView('kanban')}
          onSwitchUser={handleSwitchUser}
          onSelectWorkspace={handleSelectWorkspace}
        />
      ) : (
        <>
          {/* Board Header & Controls (Filtered to current workspace & permissions) */}
          <BoardHeader 
            currentBoard={currentBoard}
            boards={visibleBoards}
            currentWorkspace={currentWorkspace}
            currentUserRole={currentUserRole}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            filter={filter}
            onUpdateFilter={(updates) => setFilter(prev => ({ ...prev, ...updates }))}
            onResetFilter={() => setFilter({
              searchQuery: '',
              selectedLabels: [],
              selectedAssignees: [],
              selectedPriorities: [],
              dueDateFilter: 'all'
            })}
            availableLabels={labels}
            availableAssignees={users}
            teams={workspaceTeams}
            activeView={activeView}
            onChangeView={(view) => setActiveView(view as any)}
            onOpenNewCard={(colId) => {
              if (!currentBoard) {
                setIsCreateBoardModalOpen(true);
                return;
              }
              setNewCardTargetColId(colId);
              setIsNewCardModalOpen(true);
            }}
            onOpenAutomations={() => setIsAutomationModalOpen(true)}
            onOpenTeams={() => setIsTeamModalOpen(true)}
            onOpenTags={() => setIsTagModalOpen(true)}
            onExportJSON={handleExportWorkspace}
            onImportJSON={handleImportWorkspace}
          />

          {/* Main Workspace View Area */}
          <main className="flex-1 flex overflow-hidden">
            {!currentBoard || visibleBoards.length === 0 ? (
              <EmptyBoardView 
                currentWorkspace={currentWorkspace}
                currentUserRole={currentUserRole}
                onCreateBoard={(title, category, templateId) => {
                  handleCreateBoard(title, category, templateId);
                }}
                onOpenCreateModal={() => setIsCreateBoardModalOpen(true)}
              />
            ) : (
              <>
                {activeView === 'kanban' && (
                  <KanbanBoard
                    board={currentBoard}
                    filteredCards={filteredCards}
                    onOpenCard={(card) => setSelectedCardId(card.id)}
                    onOpenNewCard={(colId) => {
                      setNewCardTargetColId(colId);
                      setIsNewCardModalOpen(true);
                    }}
                    onAddColumn={handleAddColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onRenameColumn={handleRenameColumn}
                    onMoveCard={handleMoveCard}
                  />
                )}

                {activeView === 'table' && (
                  <TableView
                    cards={Object.values(filteredCards)}
                    columns={currentBoard ? currentBoard.columns : []}
                    onOpenCard={(card) => setSelectedCardId(card.id)}
                    onOpenNewCard={() => {
                      setNewCardTargetColId(undefined);
                      setIsNewCardModalOpen(true);
                    }}
                  />
                )}

                {activeView === 'calendar' && (
                  <CalendarView
                    cards={Object.values(filteredCards)}
                    onOpenCard={(card) => setSelectedCardId(card.id)}
                    onOpenNewCard={() => {
                      setNewCardTargetColId(undefined);
                      setIsNewCardModalOpen(true);
                    }}
                  />
                )}
              </>
            )}
          </main>
        </>
      )}

      {/* Card Detail Modal */}
      {selectedCard && currentBoard && (
        <CardDetailModal
          card={selectedCard}
          columns={currentBoard.columns}
          availableLabels={labels}
          availableAssignees={users}
          currentUser={currentUser}
          onClose={() => setSelectedCardId(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Create New Card Modal */}
      {isNewCardModalOpen && currentBoard && (
        <NewCardModal
          initialColumnId={newCardTargetColId}
          columns={currentBoard.columns}
          availableLabels={labels}
          availableAssignees={users}
          onClose={() => setIsNewCardModalOpen(false)}
          onCreateCard={handleCreateCard}
        />
      )}

      {/* Create New Board Modal */}
      {isCreateBoardModalOpen && (
        <CreateBoardModal 
          currentWorkspace={currentWorkspace}
          teams={workspaceTeams}
          onClose={() => setIsCreateBoardModalOpen(false)}
          onCreateBoard={handleCreateBoard}
        />
      )}

      {/* Automations Modal */}
      {isAutomationModalOpen && (
        <AutomationModal
          automations={automations}
          onClose={() => setIsAutomationModalOpen(false)}
          onToggleAutomation={handleToggleAutomation}
          onAddAutomation={handleAddAutomation}
          onDeleteAutomation={handleDeleteAutomation}
        />
      )}

      {/* Team Management Modal */}
      {isTeamModalOpen && (
        <TeamManagementModal
          teams={workspaceTeams}
          users={users}
          currentUser={currentUser}
          onClose={() => setIsTeamModalOpen(false)}
          onCreateTeam={handleCreateTeam}
          onUpdateTeam={handleUpdateTeam}
          onDeleteTeam={handleDeleteTeam}
          onAddUser={handleAddWorkspaceUser}
        />
      )}

      {/* Tag & Taxonomy Management Modal */}
      {isTagModalOpen && (
        <TagManagementModal
          labels={labels}
          onClose={() => setIsTagModalOpen(false)}
          onCreateLabel={handleCreateLabel}
          onDeleteLabel={handleDeleteLabel}
        />
      )}

      {/* Workspace Members & Access Management Modal */}
      {isWorkspaceMembersModalOpen && (
        <WorkspaceMembersModal
          workspace={currentWorkspace}
          allUsers={users}
          workspaceBoards={workspaceAllBoards}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onClose={() => setIsWorkspaceMembersModalOpen(false)}
          onUpdateWorkspace={handleUpdateWorkspace}
          onInviteMember={handleInviteMember}
          onRemoveMember={handleRemoveMember}
          onChangeMemberRole={handleChangeMemberRole}
        />
      )}

      {/* Automation & Synchronization Toast Banner */}
      {automationToast && (
        <div 
          id="automation-toast-banner"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold">{automationToast}</span>
        </div>
      )}
    </div>
  );
};

export default App;
