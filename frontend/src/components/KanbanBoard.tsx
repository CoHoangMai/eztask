import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Board, CardItem } from '../types/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  board: Board;
  filteredCards: Record<string, CardItem>;
  onOpenCard: (card: CardItem) => void;
  onOpenNewCard: (columnId?: string) => void;
  onAddColumn: (title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onMoveCard: (cardId: string, sourceColId: string, targetColId: string, targetIndex?: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  filteredCards,
  onOpenCard,
  onOpenNewCard,
  onAddColumn,
  onDeleteColumn,
  onRenameColumn,
  onMoveCard
}) => {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnTitle.trim()) {
      onAddColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div 
      id="kanban-board-scroll-area"
      className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-5 bg-slate-50/70"
    >
      {board.columns.map(column => {
        const columnCards = column.cardIds
          .filter(id => filteredCards[id] !== undefined)
          .map(id => filteredCards[id]);

        return (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={columnCards}
            onOpenCard={onOpenCard}
            onOpenNewCard={onOpenNewCard}
            onDeleteColumn={onDeleteColumn}
            onRenameColumn={onRenameColumn}
            onMoveCard={onMoveCard}
          />
        );
      })}

      {/* Add List Button / Inline Form */}
      <div className="flex-shrink-0 w-80">
        {!isAddingColumn ? (
          <button
            id="add-new-column-btn"
            onClick={() => setIsAddingColumn(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-white/70 hover:bg-white border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl text-slate-600 hover:text-blue-600 font-medium text-sm transition-all shadow-xs"
          >
            <Plus size={18} />
            <span>Add another list</span>
          </button>
        ) : (
          <form 
            onSubmit={handleAddColumnSubmit}
            className="bg-white p-3.5 rounded-2xl border border-slate-300 shadow-md space-y-2.5"
          >
            <input
              type="text"
              placeholder="Enter list title..."
              value={newColumnTitle}
              onChange={e => setNewColumnTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!newColumnTitle.trim()}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                Add List
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};