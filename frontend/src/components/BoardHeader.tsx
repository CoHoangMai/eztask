import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Layers, 
  Table as TableIcon, 
  Calendar as CalendarIcon, 
  Zap, 
  Tag, 
  User, 
  AlertCircle, 
  Clock, 
  X, 
  ChevronDown, 
  MoreHorizontal, 
  Download, 
  Upload,
  Users,
  Layout,
  Code,
  Megaphone,
  UserCheck,
  DollarSign,
  Palette,
  CalendarCheck,
  Eye
} from 'lucide-react';
import type { Board, FilterState, Assignee, Label, Priority, Team, Workspace, WorkspaceRole } from '../types/kanban';
import { BOARD_TEMPLATES, type BoardTemplate } from '../data/initialKanbanData';

interface BoardHeaderProps {
  currentBoard?: Board | null;
  boards: Board[];
  currentWorkspace: Workspace;
  currentUserRole: WorkspaceRole;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string, category: Board['category'], templateId?: string, teamId?: string) => void;
  filter: FilterState;
  onUpdateFilter: (filter: Partial<FilterState>) => void;
  onResetFilter: () => void;
  availableLabels: Label[];
  availableAssignees: Assignee[];
  teams?: Team[];
  activeView: 'kanban' | 'table' | 'calendar';
  onChangeView: (view: 'kanban' | 'table' | 'calendar') => void;
  onOpenNewCard: (columnId?: string) => void;
  onOpenAutomations: () => void;
  onOpenTeams?: () => void;
  onOpenTags?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  currentBoard,
  boards,
  currentWorkspace,
  currentUserRole,
  onSelectBoard,
  onCreateBoard,
  filter,
  onUpdateFilter,
  onResetFilter,
  availableLabels,
  availableAssignees,
  teams = [],
  activeView,
  onChangeView,
  onOpenNewCard,
  onOpenAutomations,
  onOpenTeams,
  onOpenTags,
  onExportJSON,
  onImportJSON
}) => {
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Board Creation State with Templates
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate>(BOARD_TEMPLATES[0]);
  const [newBoardTitle, setNewBoardTitle] = useState(BOARD_TEMPLATES[0].name);
  const [newBoardCategory, setNewBoardCategory] = useState<Board['category']>(BOARD_TEMPLATES[0].category);
  const [newBoardTeamId, setNewBoardTeamId] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGuest = currentUserRole === 'guest';
  const canCreateBoard = currentUserRole !== 'guest';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      onImportJSON(file);
      e.target.value = '';
      setShowMoreActions(false);
    }
  };

  const totalCards = currentBoard ? Object.keys(currentBoard.cards || {}).length : 0;
  const completedCards = currentBoard ? currentBoard.columns
    .filter(col => col.id.toLowerCase().includes('done') || col.title.toLowerCase().includes('complete') || col.title.toLowerCase().includes('hired') || col.title.toLowerCase().includes('won') || col.title.toLowerCase().includes('settled') || col.title.toLowerCase().includes('shipped') || col.title.toLowerCase().includes('delivered'))
    .reduce((acc, col) => acc + col.cardIds.length, 0) : 0;
  
  const hasActiveFilters = 
    filter.searchQuery !== '' || 
    filter.selectedLabels.length > 0 || 
    filter.selectedAssignees.length > 0 || 
    filter.selectedPriorities.length > 0 || 
    filter.dueDateFilter !== 'all';

  const handleSelectTemplate = (tpl: BoardTemplate) => {
    setSelectedTemplate(tpl);
    setNewBoardTitle(tpl.name);
    setNewBoardCategory(tpl.category);
  };

  const handleCreateBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !canCreateBoard) return;
    onCreateBoard(
      newBoardTitle.trim(), 
      newBoardCategory, 
      selectedTemplate.id, 
      newBoardTeamId || undefined
    );
    setShowTemplateModal(false);
    setShowBoardDropdown(false);
  };

  const togglePriority = (p: Priority) => {
    const next = filter.selectedPriorities.includes(p)
      ? filter.selectedPriorities.filter(item => item !== p)
      : [...filter.selectedPriorities, p];
    onUpdateFilter({ selectedPriorities: next });
  };

  const toggleLabel = (labelId: string) => {
    const next = filter.selectedLabels.includes(labelId)
      ? filter.selectedLabels.filter(id => id !== labelId)
      : [...filter.selectedLabels, labelId];
    onUpdateFilter({ selectedLabels: next });
  };

  const toggleAssignee = (userId: string) => {
    const next = filter.selectedAssignees.includes(userId)
      ? filter.selectedAssignees.filter(id => id !== userId)
      : [...filter.selectedAssignees, userId];
    onUpdateFilter({ selectedAssignees: next });
  };

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code size={16} className="text-blue-500" />;
      case 'Megaphone': return <Megaphone size={16} className="text-pink-500" />;
      case 'UserCheck': return <UserCheck size={16} className="text-amber-500" />;
      case 'DollarSign': return <DollarSign size={16} className="text-emerald-500" />;
      case 'Palette': return <Palette size={16} className="text-purple-500" />;
      case 'CalendarCheck': return <CalendarCheck size={16} className="text-sky-500" />;
      default: return <Layout size={16} className="text-slate-500" />;
    }
  };

  return (
    <div id="board-header-container" className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
      {/* Top row: Board Switcher, Project Description, Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Board Selector */}
          <div className="relative">
            <button
              id="board-selector-btn"
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-slate-900 font-semibold text-base sm:text-lg transition-colors cursor-pointer"
            >
              <span>{currentBoard ? currentBoard.title : 'No active board'}</span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {showBoardDropdown && (
              <div 
                id="board-dropdown-menu"
                className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in"
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>{currentWorkspace.name} Boards ({boards.length})</span>
                  {isGuest && <span className="text-purple-600 font-bold text-[10px]">Guest Filtered</span>}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 my-1">
                  {boards.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-slate-400">
                      No boards available in this workspace.
                    </div>
                  ) : (
                    boards.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          onSelectBoard(b.id);
                          setShowBoardDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                          currentBoard && b.id === currentBoard.id 
                            ? 'bg-blue-50 text-blue-700 font-semibold' 
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="truncate block font-semibold">{b.title}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{b.category} workflow</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          {Object.keys(b.cards).length} tasks
                        </span>
                      </button>
                    ))
                  )}
                </div>

                {canCreateBoard ? (
                  <div className="border-t border-slate-100 pt-2 mt-1">
                    <button
                      onClick={() => {
                        setShowBoardDropdown(false);
                        setShowTemplateModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Create Board in {currentWorkspace.name}</span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-2 mt-1 px-3 py-1 text-[11px] text-slate-400 text-center">
                    Guest role: View & collaborate on assigned boards only.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Guest Role Indicator */}
          {isGuest && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold">
              <Eye size={13} />
              <span>Guest Collaborator</span>
            </div>
          )}

          {/* Quick Progress Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            <span>{completedCards}/{totalCards} completed</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: totalCards > 0 ? `${(completedCards / totalCards) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hidden File Input for Workspace Import */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />

          {/* Teams Button (only for internal members) */}
          {onOpenTeams && !isGuest && (
            <button
              id="open-teams-btn"
              onClick={onOpenTeams}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Manage Teams & Members"
            >
              <Users size={14} className="text-blue-600" />
              <span className="hidden sm:inline">Teams</span>
            </button>
          )}

          {/* Tags & Taxonomy Button */}
          {onOpenTags && !isGuest && (
            <button
              id="open-tags-btn"
              onClick={onOpenTags}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              title="Manage Custom Tags & Labels"
            >
              <Tag size={14} className="text-purple-600" />
              <span className="hidden sm:inline">Tags</span>
            </button>
          )}

          {/* Automations Button */}
          {!isGuest && (
            <button
              id="open-automations-btn"
              onClick={onOpenAutomations}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <Zap size={14} className="text-amber-500" />
              <span className="hidden sm:inline">Rules</span>
            </button>
          )}

          {/* New Task Button */}
          <button
            id="create-new-card-btn"
            onClick={() => onOpenNewCard()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>

          {/* More Actions Menu */}
          <div className="relative">
            <button
              id="board-more-actions-btn"
              onClick={() => setShowMoreActions(!showMoreActions)}
              title="Board actions & data backup"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showMoreActions 
                  ? 'bg-slate-200 border-slate-300 text-slate-900' 
                  : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MoreHorizontal size={16} />
            </button>

            {showMoreActions && (
              <div 
                id="board-more-actions-menu"
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {currentWorkspace.name} Backup
                  </span>
                </div>

                <button
                  id="menu-export-json-btn"
                  onClick={() => {
                    setShowMoreActions(false);
                    if (onExportJSON) onExportJSON();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <Download size={14} className="text-blue-500 shrink-0" />
                  <span>Export Backup (JSON)</span>
                </button>

                {!isGuest && (
                  <button
                    id="menu-import-json-btn"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                  >
                    <Upload size={14} className="text-emerald-500 shrink-0" />
                    <span>Import Backup</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {currentBoard?.description && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-1">
          {currentBoard.description}
        </p>
      )}

      {/* Secondary Bar: Views + Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            id="view-kanban-btn"
            onClick={() => onChangeView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'kanban' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Kanban</span>
          </button>
          <button
            id="view-table-btn"
            onClick={() => onChangeView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'table' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon size={14} />
            <span>Table</span>
          </button>
          <button
            id="view-calendar-btn"
            onClick={() => onChangeView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeView === 'calendar' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon size={14} />
            <span>Calendar</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          {/* Instant Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search tasks, labels, assignees..."
              value={filter.searchQuery}
              onChange={e => onUpdateFilter({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {filter.searchQuery && (
              <button 
                onClick={() => onUpdateFilter({ searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              id="toggle-filter-popover"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-xl transition-colors cursor-pointer ${
                hasActiveFilters
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </button>

            {showFilterDropdown && (
              <div 
                id="filter-options-panel"
                className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={onResetFilter}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Due Date Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} /> Due Date
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['all', 'today', 'this_week', 'overdue'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => onUpdateFilter({ dueDateFilter: option })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize border text-left cursor-pointer ${
                          filter.dueDateFilter === option
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {option.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Priority Level
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => togglePriority(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase border transition-colors cursor-pointer ${
                          filter.selectedPriorities.includes(p)
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignees Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <User size={13} /> Assignee
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableAssignees.map(u => (
                      <button
                        key={u.id}
                        onClick={() => toggleAssignee(u.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition-colors cursor-pointer ${
                          filter.selectedAssignees.includes(u.id)
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{u.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Labels Filter */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Tag size={13} /> Tags & Categories
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableLabels.map(l => (
                      <button
                        key={l.id}
                        onClick={() => toggleLabel(l.id)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                          filter.selectedLabels.includes(l.id)
                            ? `${l.bg} ${l.text} ring-2 ring-blue-500/50`
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Domain Template Creation Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Layout size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Workflow Board in {currentWorkspace.name}</h3>
                  <p className="text-xs text-slate-500">Choose a multi-domain workflow template tailored for your organization</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBoardSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Template Selection Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Domain Workflow Template</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BOARD_TEMPLATES.map(tpl => {
                    const isSelected = selectedTemplate.id === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => handleSelectTemplate(tpl)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTemplateIcon(tpl.iconName)}
                            <span className="text-xs font-bold text-slate-900">{tpl.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{tpl.description}</p>
                        </div>

                        {/* Column Preview */}
                        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto py-1">
                          {tpl.defaultColumns.map((col, idx) => (
                            <span 
                              key={idx} 
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium whitespace-nowrap"
                            >
                              {col.title}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Team Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Board Title *</label>
                  <input
                    type="text"
                    required
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="e.g. Q4 Global Brand Campaign"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assign to Team (Optional)</label>
                  <select
                    value={newBoardTeamId}
                    onChange={(e) => setNewBoardTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">General (Cross-functional)</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBoardTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
