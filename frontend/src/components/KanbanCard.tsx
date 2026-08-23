import React, { useState } from 'react';
import { 
  CheckSquare, 
  MessageSquare, 
  Clock, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { CardItem, Priority } from '../types/kanban';

interface KanbanCardProps {
  card: CardItem;
  index: number;
  columnId: string;
  onClick: () => void;
  onMoveCard?: (cardId: string, sourceColId: string, targetColId: string, targetIndex?: number) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  card,
  index,
  columnId,
  onClick,
  onMoveCard
}) => {
  const [isDropIndicator, setIsDropIndicator] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.setData('sourceColumnId', columnId);
    e.dataTransfer.setData('sourceIndex', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDropIndicator) setIsDropIndicator(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropIndicator(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropIndicator(false);

    const draggedCardId = e.dataTransfer.getData('text/plain');
    const sourceColId = e.dataTransfer.getData('sourceColumnId');

    if (draggedCardId && onMoveCard) {
      onMoveCard(draggedCardId, sourceColId, columnId, index);
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded-md border border-rose-200">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-md border border-amber-200">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-blue-50 text-blue-700 rounded-md border border-blue-200">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md">Low</span>;
    }
  };

  const totalChecklist = card.checklist?.length || 0;
  const completedChecklist = card.checklist?.filter(c => c.completed).length || 0;
  const isChecklistDone = totalChecklist > 0 && totalChecklist === completedChecklist;
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.columnId.includes('done');

  return (
    <div
      id={`kanban-card-${card.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={onClick}
      className={`group bg-white rounded-xl p-3.5 shadow-xs hover:shadow-md border cursor-pointer transition-all duration-150 relative overflow-hidden ${
        isDropIndicator 
          ? 'border-t-4 border-t-blue-500 border-slate-300 scale-[1.01]' 
          : 'border-slate-200/90 hover:border-blue-400'
      }`}
    >
      {/* Optional Top Color Bar */}
      {card.coverColor && (
        <div 
          className="absolute top-0 left-0 right-0 h-1.5" 
          style={{ backgroundColor: card.coverColor }}
        />
      )}

      {/* Labels & Priority Row */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2 mt-0.5">
        <div className="flex flex-wrap gap-1">
          {card.labels?.map(lbl => (
            <span
              key={lbl.id}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${lbl.bg} ${lbl.text} border ${lbl.border || 'border-transparent'}`}
            >
              {lbl.name}
            </span>
          ))}
        </div>
        <div>
          {getPriorityBadge(card.priority)}
        </div>
      </div>

      {/* Card Title */}
      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
        {card.title}
      </h4>

      {/* Description Snippet */}
      {card.description && (
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Badges & Meta info */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-500 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {card.dueDate && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${
              isOverdue ? 'text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded' : 'text-slate-500'
            }`}>
              {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
              <span>{card.dueDate}</span>
            </div>
          )}

          {totalChecklist > 0 && (
            <div className={`flex items-center gap-1 text-[11px] font-medium ${
              isChecklistDone ? 'text-emerald-600 font-semibold' : 'text-slate-500'
            }`}>
              <CheckSquare size={12} />
              <span>{completedChecklist}/{totalChecklist}</span>
            </div>
          )}

          {card.comments && card.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MessageSquare size={12} />
              <span>{card.comments.length}</span>
            </div>
          )}

          {card.estimatedHours && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock size={11} />
              <span>{card.estimatedHours}h</span>
            </div>
          )}
        </div>

        {card.assignees && card.assignees.length > 0 && (
          <div className="flex items-center -space-x-1.5 overflow-hidden flex-shrink-0">
            {card.assignees.map(u => (
              <img
                key={u.id}
                src={u.avatar}
                alt={u.name}
                title={u.name}
                className="inline-block w-6 h-6 rounded-full ring-2 ring-white object-cover shadow-xs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};