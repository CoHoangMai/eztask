import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';
import type { Column, CardItem } from '../types/kanban';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  cards: CardItem[];
  onOpenCard: (card: CardItem) => void;
  onOpenNewCard: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onMoveCard: (cardId: string, sourceColId: string, targetColId: string, targetIndex?: number) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  cards,
  onOpenCard,
  onOpenNewCard,
  onDeleteColumn,
  onRenameColumn,
  onMoveCard
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onRenameColumn(column.id, titleInput.trim());
    } else {
      setTitleInput(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    const sourceColId = e.dataTransfer.getData('sourceColumnId');
    if (cardId) {
      onMoveCard(cardId, sourceColId, column.id);
    }
  };

  const isOverLimit = column.limit !== undefined && cards.length > column.limit;

  return (
    <div
      id={`kanban-column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-shrink-0 w-80 bg-slate-100/90 rounded-2xl p-3 max-h-full border transition-all duration-200 ${
        isDragOver 
          ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-200' 
          : 'border-slate-200/80 shadow-sm'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1.5 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {column.colorAccent && (
            <span 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
              style={{ backgroundColor: column.colorAccent }}
            />
          )}

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                autoFocus
                className="w-full px-2 py-1 text-sm font-semibold bg-white border border-blue-400 rounded focus:outline-none"
              />
              <button type="submit" className="p-1 text-emerald-600 hover:bg-slate-200 rounded">
                <Check size={14} />
              </button>
              <button 
                type="button" 
                onClick={() => { setTitleInput(column.title); setIsEditingTitle(false); }}
                className="p-1 text-slate-400 hover:bg-slate-200 rounded"
              >
                <X size={14} />
              </button>
            </form>
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-slate-800 truncate cursor-pointer hover:text-blue-600 transition-colors"
              title="Click to rename"
            >
              {column.title}
            </h3>
          )}

          {/* Card count badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            isOverLimit 
              ? 'bg-rose-100 text-rose-700 font-bold flex items-center gap-1' 
              : 'bg-slate-200 text-slate-700'
          }`}>
            {cards.length}
            {column.limit && `/${column.limit}`}
            {isOverLimit && <AlertCircle size={12} className="inline text-rose-600" />}
          </span>
        </div>

        {/* Column Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>

          {showMenu && (
            <div 
              className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5 space-y-1"
            >
              <button
                onClick={() => {
                  setIsEditingTitle(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Edit2 size={13} />
                <span>Rename column</span>
              </button>
              <button
                onClick={() => {
                  onOpenNewCard(column.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Plus size={13} />
                <span>Add card here</span>
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  onDeleteColumn(column.id);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                <Trash2 size={13} />
                <span>Delete list</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards List Container */}
      <div 
        id={`column-cards-container-${column.id}`}
        className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 min-h-[60px] max-h-[calc(100vh-250px)]"
      >
        {cards.map((card, index) => (
          <KanbanCard
            key={card.id}
            card={card}
            index={index}
            columnId={column.id}
            onClick={() => onOpenCard(card)}
            onMoveCard={onMoveCard}
          />
        ))}

        {cards.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-xl">
            <span>No tasks in this list</span>
            <button
              onClick={() => onOpenNewCard(column.id)}
              className="mt-2 text-blue-600 hover:underline font-medium"
            >
              + Add a task
            </button>
          </div>
        )}
      </div>

      {/* Add Card Quick Button */}
      <button
        id={`add-card-btn-${column.id}`}
        onClick={() => onOpenNewCard(column.id)}
        className="mt-2.5 flex items-center gap-2 w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-colors text-left"
      >
        <Plus size={15} />
        <span>Add a card</span>
      </button>
    </div>
  );
};