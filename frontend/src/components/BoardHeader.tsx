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
} from 'lucide-react';
import type { Board, FilterState, Assignee, Label, Priority } from '../types/kanban';

interface BoardHeaderProps {
  currentBoard: Board;
  boards: Board[];
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (title: string, category: Board['category']) => void;
  filter: FilterState;
  onUpdateFilter: (filter: Partial<FilterState>) => void;
  onResetFilter: () => void;
  availableLabels: Label[];
  availableAssignees: Assignee[];
  activeView: 'kanban' | 'table' | 'calendar';
  onChangeView: (view: 'kanban' | 'table' | 'calendar') => void;
  onOpenNewCard: (columnId?: string) => void;
  onOpenAutomations: () => void;
  onExportJSON?: () => void;
  onImportJSON?: (file: File) => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  currentBoard,
  boards,
  onSelectBoard,
  onCreateBoard,
  filter,
  onUpdateFilter,
  onResetFilter,
  availableLabels,
  availableAssignees,
  activeView,
  onChangeView,
  onOpenNewCard,
  onOpenAutomations,
  onExportJSON,
  onImportJSON
}) => {
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardCategory, setNewBoardCategory] = useState<Board['category']>('product');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImportJSON) {
      onImportJSON(file);
      e.target.value = '';
      setShowMoreActions(false);
    }
  };

  const totalCards = Object.keys(currentBoard.cards).length;
  const completedCards = currentBoard.columns
    .filter(col => col.id.toLowerCase().includes('done') || col.title.toLowerCase().includes('complete'))
    .reduce((acc, col) => acc + col.cardIds.length, 0);
  
  const hasActiveFilters = 
    filter.searchQuery !== '' || 
    filter.selectedLabels.length > 0 || 
    filter.selectedAssignees.length > 0 || 
    filter.selectedPriorities.length > 0 || 
    filter.dueDateFilter !== 'all';

  const handleCreateBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    onCreateBoard(newBoardTitle.trim(), newBoardCategory);
    setNewBoardTitle('');
    setIsCreatingBoard(false);
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

  return (
    <div id="board-header-container" className="bg-white border-b border-slate-200 px-6 py-4">
      {/* Top row: Board Switcher, Project Description, Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Board Selector */}
          <div className="relative">
            <button
              id="board-selector-btn"
              onClick={() => setShowBoardDropdown(!showBoardDropdown)}
              className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-900 font-semibold text-lg transition-colors"
            >
              <span>{currentBoard.title}</span>
              <ChevronDown size={18} className="text-slate-500" />
            </button>

            {showBoardDropdown && (
              <div 
                id="board-dropdown-menu"
                className="absolute top-full left-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2"
              >
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Your Boards
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 my-1">
                  {boards.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onSelectBoard(b.id);
                        setShowBoardDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-colors ${
                        b.id === currentBoard.id 
                          ? 'bg-blue-50 text-blue-700 font-semibold' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{b.title}</span>
                      <span className="text-xs text-slate-400 font-normal">
                        {Object.keys(b.cards).length} cards
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-2 mt-1">
                  {!isCreatingBoard ? (
                    <button
                      onClick={() => setIsCreatingBoard(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                      <span>Create New Board</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreateBoardSubmit} className="space-y-2 p-1">
                      <input
                        type="text"
                        placeholder="Board title..."
                        value={newBoardTitle}
                        onChange={e => setNewBoardTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <select
                        value={newBoardCategory}
                        onChange={e => setNewBoardCategory(e.target.value as Board['category'])}
                        className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg text-slate-600"
                      >
                        <option value="product">Product & Engineering</option>
                        <option value="marketing">Marketing & Sales</option>
                        <option value="operations">Operations & HR</option>
                        <option value="design">Design & Creative</option>
                        <option value="general">General / Personal</option>
                      </select>
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setIsCreatingBoard(false)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newBoardTitle.trim()}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Progress Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
            <span>{completedCards}/{totalCards} completed</span>
            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: totalCards > 0 ? `${(completedCards / totalCards) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Hidden File Input for Workspace Import */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".json,application/json" 
            className="hidden" 
          />

          {/* Automations Button */}
          <button
            id="open-automations-btn"
            onClick={onOpenAutomations}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Zap size={16} className="text-amber-500" />
            <span className="hidden sm:inline">Automations</span>
          </button>

          {/* New Card Button */}
          <button
            id="create-new-card-btn"
            onClick={() => onOpenNewCard()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>

          {/* More Actions Menu (Export/Import Data Backup) */}
          <div className="relative">
            <button
              id="board-more-actions-btn"
              onClick={() => setShowMoreActions(!showMoreActions)}
              title="Board actions & data backup"
              className={`p-2 rounded-lg border transition-colors ${
                showMoreActions 
                  ? 'bg-slate-200 border-slate-300 text-slate-900' 
                  : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreActions && (
              <div 
                id="board-more-actions-menu"
                className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-3 py-1 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Workspace Actions
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
                  <Download size={14} className="text-blue-500 flex-shrink-0" />
                  <span>Export JSON</span>
                </button>

                <button
                  id="menu-import-json-btn"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                >
                  <Upload size={14} className="text-emerald-500 flex-shrink-0" />
                  <span>Import JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {currentBoard.description && (
        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
          {currentBoard.description}
        </p>
      )}

      {/* Secondary Bar: Views + Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start">
          <button
            id="view-kanban-btn"
            onClick={() => onChangeView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'kanban' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Kanban</span>
          </button>
          <button
            id="view-table-btn"
            onClick={() => onChangeView('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'table' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon size={14} />
            <span>Table</span>
          </button>
          <button
            id="view-calendar-btn"
            onClick={() => onChangeView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeView === 'calendar' 
                ? 'bg-white text-slate-900 shadow-sm' 
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
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Search tasks, tags, users..."
              value={filter.searchQuery}
              onChange={e => onUpdateFilter({ searchQuery: e.target.value })}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors ${
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
                className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 p-4 space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Filters</span>
                  {hasActiveFilters && (
                    <button
                      onClick={onResetFilter}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Reset all
                    </button>
                  )}
                </div>

                {/* Due Date Filter */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Clock size={13} /> Due Date
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['all', 'today', 'this_week', 'overdue'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => onUpdateFilter({ dueDateFilter: option })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border text-left ${
                          filter.dueDateFilter === option
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
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
                  <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> Priority
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['urgent', 'high', 'medium', 'low'] as Priority[]).map(p => (
                      <button
                        key={p}
                        onClick={() => togglePriority(p)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize border ${
                          filter.selectedPriorities.includes(p)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Labels Filter */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Tag size={13} /> Labels
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {availableLabels.map(lbl => {
                      const isSelected = filter.selectedLabels.includes(lbl.id);
                      return (
                        <button
                          key={lbl.id}
                          onClick={() => toggleLabel(lbl.id)}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            isSelected
                              ? `${lbl.bg} ${lbl.text} ring-2 ring-blue-500`
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {lbl.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assignees Filter */}
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <User size={13} /> Assignees
                  </label>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {availableAssignees.map(u => {
                      const isSelected = filter.selectedAssignees.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          onClick={() => toggleAssignee(u.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="truncate">{u.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
