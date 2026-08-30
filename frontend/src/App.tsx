import React, { useState, useMemo, useEffect } from 'react';
import type { Board, CardItem, Column, FilterState, AutomationRule, Assignee } from './types/kanban';
import { 
  INITIAL_BOARDS, 
  DEFAULT_USERS, 
  DEFAULT_LABELS, 
  DEFAULT_AUTOMATIONS 
} from './data/initialKanbanData';
import { Navbar } from './components/Navbar';
import { BoardHeader } from './components/BoardHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { TableView } from './components/TableView';
import { CalendarView } from './components/CalendarView';
import { CardDetailModal } from './components/CardDetailModal';
import { NewCardModal } from './components/NewCardModal';
import { AutomationModal } from './components/AutomationModal';
import { AuthModal } from './components/AuthModal';
import { exportWorkspaceToJSON, parseImportedWorkspace } from './utils/exportHelper';
import { isBackendAvailable, authApi, taskApi } from './api';

/**
 * Storage keys for persisting user workspace state in browser localStorage.
 */
const STORAGE_KEYS = {
  BOARDS: 'eztask_boards_data',
  ACTIVE_BOARD_ID: 'eztask_active_board_id',
  AUTOMATIONS: 'eztask_automations_data',
  CURRENT_USER: 'eztask_current_user',
};

/**
 * Root Application Component
 * Controls board state, filters, active views, modal dialogs, and microservices API integration.
 */
export const App: React.FC = () => {
  // ---------------------------------------------------------------------------
  // 1. State Management: User Identity & Gateway Health
  // ---------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<Assignee>(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) return JSON.parse(savedUser);
    } catch {}
    return DEFAULT_USERS[0];
  });

  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Check Spring Cloud Gateway connectivity on mount
  useEffect(() => {
    isBackendAvailable().then((available) => {
      setIsOnline(available);
      if (available) {
        // Attempt to fetch live boards from Task Service
        taskApi.getBoards().then(liveBoards => {
          if (liveBoards && liveBoards.length > 0) {
            setBoards(liveBoards);
          }
        }).catch(() => {});
      }
    });
  }, []);

  // ---------------------------------------------------------------------------
  // 2. State Management: Boards & Active Workspace
  // ---------------------------------------------------------------------------
  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOARDS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to parse saved boards from localStorage:', err);
    }
    return INITIAL_BOARDS;
  });

  const [currentBoardId, setCurrentBoardId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD_ID);
      if (savedId) {
        return savedId;
      }
    } catch {
      // Fallback to default initial board ID
    }
    return INITIAL_BOARDS[0].id;
  });

  const [activeView, setActiveView] = useState<'kanban' | 'table' | 'calendar'>('kanban');

  const [automations, setAutomations] = useState<AutomationRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTOMATIONS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Failed to parse saved automations from localStorage:', err);
    }
    return DEFAULT_AUTOMATIONS;
  });
  
  // ---------------------------------------------------------------------------
  // 3. State Management: Modals & Dialogs
  // ---------------------------------------------------------------------------
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState<boolean>(false);
  const [newCardTargetColId, setNewCardTargetColId] = useState<string | undefined>(undefined);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState<boolean>(false);
  const [automationToast, setAutomationToast] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 4. State Management: Filters
  // ---------------------------------------------------------------------------
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    selectedLabels: [],
    selectedAssignees: [],
    selectedPriorities: [],
    dueDateFilter: 'all'
  });

  // ---------------------------------------------------------------------------
  // 5. Synchronization: Persist state changes to browser localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
    } catch (err) {
      console.error('Failed to save boards to localStorage:', err);
    }
  }, [boards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD_ID, currentBoardId);
    } catch (err) {
      console.error('Failed to save active board ID to localStorage:', err);
    }
  }, [currentBoardId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTOMATIONS, JSON.stringify(automations));
    } catch (err) {
      console.error('Failed to save automations to localStorage:', err);
    }
  }, [automations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch (err) {}
  }, [currentUser]);

  // ---------------------------------------------------------------------------
  // 6. Computed: Resolve current board instance
  // ---------------------------------------------------------------------------
  const currentBoard = useMemo(() => {
    return boards.find(b => b.id === currentBoardId) || boards[0];
  }, [boards, currentBoardId]);

  // Filtered cards calculation
  const filteredCards = useMemo(() => {
    const cardsObj = currentBoard.cards;
    const result: Record<string, CardItem> = {};
    const todayStr = new Date().toISOString().split('T')[0];

    (Object.entries(cardsObj) as [string, CardItem][]).forEach(([id, card]) => {
      // Search query filter
      if (filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase();
        const titleMatch = card.title.toLowerCase().includes(q);
        const descMatch = card.description ? card.description.toLowerCase().includes(q) : false;
        const labelMatch = card.labels?.some(l => l.name.toLowerCase().includes(q));
        const assigneeMatch = card.assignees?.some(a => a.name.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !labelMatch && !assigneeMatch) return;
      }

      // Labels filter
      if (filter.selectedLabels.length > 0) {
        const hasLabel = card.labels?.some(l => filter.selectedLabels.includes(l.id));
        if (!hasLabel) return;
      }

      // Assignees filter
      if (filter.selectedAssignees.length > 0) {
        const hasAssignee = card.assignees?.some(a => filter.selectedAssignees.includes(a.id));
        if (!hasAssignee) return;
      }

      // Priority filter
      if (filter.selectedPriorities.length > 0) {
        if (!filter.selectedPriorities.includes(card.priority)) return;
      }

      // Due date filter
      if (filter.dueDateFilter !== 'all') {
        if (!card.dueDate) return;
        if (filter.dueDateFilter === 'today' && card.dueDate !== todayStr) return;
        if (filter.dueDateFilter === 'overdue' && card.dueDate >= todayStr) return;
      }

      result[id] = card;
    });

    return result;
  }, [currentBoard, filter]);

  // Active selected card object
  const selectedCard = selectedCardId ? currentBoard.cards[selectedCardId] : null;

  // Board actions
  const handleSelectBoard = (boardId: string) => {
    setCurrentBoardId(boardId);
  };

  const handleCreateBoard = async (title: string, category: Board['category']) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      columns: [
        { id: `col-todo-${Date.now()}`, title: 'To Do', cardIds: [], colorAccent: '#3b82f6' },
        { id: `col-inprogress-${Date.now()}`, title: 'In Progress', cardIds: [], colorAccent: '#f59e0b' },
        { id: `col-done-${Date.now()}`, title: 'Done', cardIds: [], colorAccent: '#10b981' }
      ],
      cards: {}
    };

    setBoards(prev => [...prev, newBoard]);
    setCurrentBoardId(newBoard.id);

    if (isOnline) {
      taskApi.createBoard({ title, category }).catch(err => {
        console.warn('API sync warning:', err);
      });
    }
  };

  const handleAddColumn = (title: string) => {
    const newCol: Column = {
      id: `col-${Date.now()}`,
      title,
      cardIds: [],
      colorAccent: '#64748b'
    };

    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;
      return {
        ...b,
        columns: [...b.columns, newCol],
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.addColumn(currentBoard.id, title).catch(console.warn);
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;
      return {
        ...b,
        columns: b.columns.filter(c => c.id !== columnId),
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.deleteColumn(currentBoard.id, columnId).catch(console.warn);
    }
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;
      return {
        ...b,
        columns: b.columns.map(col => col.id === columnId ? { ...col, title: newTitle } : col),
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.updateColumn(currentBoard.id, columnId, newTitle).catch(console.warn);
    }
  };

  // Card movement & positional reordering (Drag and Drop)
  const handleMoveCard = (
    cardId: string, 
    sourceColId: string, 
    targetColId: string, 
    targetIndex?: number
  ) => {
    if (!currentBoard.cards[cardId]) return;

    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;

      const card = b.cards[cardId];
      if (!card) return b;

      const updatedCard = {
        ...card,
        columnId: targetColId,
        updatedAt: new Date().toISOString()
      };

      const updatedColumns = b.columns.map(col => {
        if (sourceColId === targetColId && col.id === targetColId) {
          const filtered = col.cardIds.filter(id => id !== cardId);
          if (typeof targetIndex === 'number' && targetIndex >= 0) {
            filtered.splice(targetIndex, 0, cardId);
          } else {
            filtered.push(cardId);
          }
          return { ...col, cardIds: filtered };
        }

        if (col.id === sourceColId) {
          return {
            ...col,
            cardIds: col.cardIds.filter(id => id !== cardId)
          };
        }

        if (col.id === targetColId) {
          const currentList = [...col.cardIds.filter(id => id !== cardId)];
          if (typeof targetIndex === 'number' && targetIndex >= 0) {
            currentList.splice(targetIndex, 0, cardId);
          } else {
            currentList.push(cardId);
          }
          return {
            ...col,
            cardIds: currentList
          };
        }

        return col;
      });

      return {
        ...b,
        columns: updatedColumns,
        cards: {
          ...b.cards,
          [cardId]: updatedCard
        },
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.moveCard(cardId, sourceColId, targetColId, targetIndex).catch(console.warn);
    }
  };

  // Workspace JSON Backup Export & Import Handlers
  const handleExportWorkspace = () => {
    exportWorkspaceToJSON(boards, automations);
    setAutomationToast('Workspace backup exported successfully as JSON file!');
    setTimeout(() => setAutomationToast(null), 4000);
  };

  const handleImportWorkspace = async (file: File) => {
    try {
      const data = await parseImportedWorkspace(file);
      setBoards(data.boards);
      if (data.automations && Array.isArray(data.automations)) {
        setAutomations(data.automations);
      }
      if (data.boards.length > 0) {
        setCurrentBoardId(data.boards[0].id);
      }
      setAutomationToast(' Workspace restored successfully from JSON backup!');
      setTimeout(() => setAutomationToast(null), 4000);
    } catch (err: any) {
      console.error('Import failed:', err);
      setAutomationToast(` Failed to import backup: ${err?.message || 'Invalid file'}`);
      setTimeout(() => setAutomationToast(null), 5000);
    }
  };

  // Create Card
  const handleCreateCard = (cardData: Omit<CardItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `card-${Date.now()}`;
    const newCard: CardItem = {
      ...cardData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;
      return {
        ...b,
        columns: b.columns.map(col => col.id === newCard.columnId ? {
          ...col,
          cardIds: [...col.cardIds, newId]
        } : col),
        cards: {
          ...b.cards,
          [newId]: newCard
        },
        updatedAt: new Date().toISOString()
      };
    }));

    setIsNewCardModalOpen(false);

    if (isOnline) {
      taskApi.createCard(currentBoard.id, cardData).catch(console.warn);
    }

    // Rule: Urgent priority alert trigger
    if (newCard.priority === 'urgent') {
      const urgentRule = automations.find(r => r.enabled && r.triggerEvent === 'card_created');
      if (urgentRule) {
        setAutomationToast(`Urgent card "${newCard.title}" created & alerted!`);
        setTimeout(() => setAutomationToast(null), 4000);
      }
    }
  };

  // Update Card
  const handleUpdateCard = (updatedCard: CardItem) => {
    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;

      const oldCard = b.cards[updatedCard.id];
      let updatedColumns = b.columns;

      if (oldCard && oldCard.columnId !== updatedCard.columnId) {
        updatedColumns = b.columns.map(col => {
          if (col.id === oldCard.columnId) {
            return { ...col, cardIds: col.cardIds.filter(id => id !== updatedCard.id) };
          }
          if (col.id === updatedCard.columnId) {
            return { ...col, cardIds: [...col.cardIds.filter(id => id !== updatedCard.id), updatedCard.id] };
          }
          return col;
        });
      }

      return {
        ...b,
        columns: updatedColumns,
        cards: {
          ...b.cards,
          [updatedCard.id]: updatedCard
        },
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.updateCard(updatedCard).catch(console.warn);
    }

    // Rule: Check if all checklist items are done -> auto-move to Done column
    if (updatedCard.checklist && updatedCard.checklist.length > 0) {
      const allDone = updatedCard.checklist.every(item => item.completed);
      if (allDone) {
        const autoMoveRule = automations.find(r => r.enabled && r.triggerEvent === 'checklist_completed');
        const doneCol = currentBoard.columns.find(c => c.id.includes('done') || c.title.toLowerCase().includes('done'));
        
        if (autoMoveRule && doneCol && updatedCard.columnId !== doneCol.id) {
          handleMoveCard(updatedCard.id, updatedCard.columnId, doneCol.id);
          setAutomationToast(`"${updatedCard.title}" checklist complete! Auto-moved to ${doneCol.title}.`);
          setTimeout(() => setAutomationToast(null), 4000);
        }
      }
    }
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    setBoards(prev => prev.map(b => {
      if (b.id !== currentBoard.id) return b;

      const newCards = { ...b.cards };
      delete newCards[cardId];

      return {
        ...b,
        columns: b.columns.map(col => ({
          ...col,
          cardIds: col.cardIds.filter(id => id !== cardId)
        })),
        cards: newCards,
        updatedAt: new Date().toISOString()
      };
    }));

    if (isOnline) {
      taskApi.deleteCard(cardId).catch(console.warn);
    }

    setSelectedCardId(null);
  };

  // Automation handlers
  const handleToggleAutomation = (ruleId: string) => {
    setAutomations(prev => prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r));
  };

  const handleAddAutomation = (rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: `auto-${Date.now()}`
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

  // IAM Auth Handlers
  const handleLogin = async (email: string, password?: string): Promise<boolean> => {
    try {
      if (isOnline) {
        const res = await authApi.login({ email, password });
        if (res.user) {
          setCurrentUser(res.user);
          setAutomationToast(` Logged in as ${res.user.name} (JWT token saved)`);
          setTimeout(() => setAutomationToast(null), 4000);
          return true;
        }
      } else {
        // Standalone demo mode fallback
        const matchingUser = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
          id: `user-${Date.now()}`,
          name: email.split('@')[0],
          email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'Full-Stack Developer'
        };
        setCurrentUser(matchingUser);
        setAutomationToast(` Switched to profile: ${matchingUser.name}`);
        setTimeout(() => setAutomationToast(null), 4000);
        return true;
      }
    } catch (err: any) {
      console.error(err);
      return false;
    }
    return false;
  };

  const handleRegister = async (name: string, email: string, role: string): Promise<boolean> => {
    try {
      if (isOnline) {
        const res = await authApi.register({ name, email, role });
        if (res.user) {
          setCurrentUser(res.user);
          setAutomationToast(` Account created in PostgreSQL for ${name}`);
          setTimeout(() => setAutomationToast(null), 4000);
          return true;
        }
      } else {
        const newUser: Assignee = {
          id: `user-${Date.now()}`,
          name,
          email,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role
        };
        setCurrentUser(newUser);
        setAutomationToast(` Demo account created for ${name}`);
        setTimeout(() => setAutomationToast(null), 4000);
        return true;
      }
    } catch (err: any) {
      console.error(err);
      return false;
    }
    return false;
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(DEFAULT_USERS[0]);
    setIsAuthModalOpen(false);
    setAutomationToast(' Logged out of session');
    setTimeout(() => setAutomationToast(null), 3000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navbar */}
      <Navbar 
        currentUser={currentUser}
        activeBoardTitle={currentBoard.title}
        isOnline={isOnline}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Board Header & Controls */}
      <BoardHeader 
        currentBoard={currentBoard}
        boards={boards}
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
        availableLabels={DEFAULT_LABELS}
        availableAssignees={DEFAULT_USERS}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenNewCard={(colId) => {
          setNewCardTargetColId(colId);
          setIsNewCardModalOpen(true);
        }}
        onOpenAutomations={() => setIsAutomationModalOpen(true)}
        onExportJSON={handleExportWorkspace}
        onImportJSON={handleImportWorkspace}
      />

      {/* Main View Area */}
      <main className="flex-1 flex overflow-hidden">
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
            columns={currentBoard.columns}
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
      </main>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          columns={currentBoard.columns}
          availableLabels={DEFAULT_LABELS}
          availableAssignees={DEFAULT_USERS}
          currentUser={currentUser}
          onClose={() => setSelectedCardId(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* Create New Card Modal */}
      {isNewCardModalOpen && (
        <NewCardModal
          initialColumnId={newCardTargetColId}
          columns={currentBoard.columns}
          availableLabels={DEFAULT_LABELS}
          availableAssignees={DEFAULT_USERS}
          onClose={() => setIsNewCardModalOpen(false)}
          onCreateCard={handleCreateCard}
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

      {/* Identity & Access Management (Auth) Modal */}
      {isAuthModalOpen && (
        <AuthModal
          currentUser={currentUser}
          isOnline={isOnline}
          onClose={() => setIsAuthModalOpen(false)}
          onSelectUser={(user) => {
            setCurrentUser(user);
            setAutomationToast(` Switched to profile: ${user.name}`);
            setTimeout(() => setAutomationToast(null), 3000);
          }}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
        />
      )}

      {/* Automation & Backup Toast Banner */}
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
