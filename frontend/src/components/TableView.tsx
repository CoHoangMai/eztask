import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  Calendar, 
  CheckSquare, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import type { CardItem, Column, Priority } from '../types/kanban';

interface TableViewProps {
  cards: CardItem[];
  columns: Column[];
  onOpenCard: (card: CardItem) => void;
  onOpenNewCard: (columnId?: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  cards,
  columns,
  onOpenCard,
  onOpenNewCard
}) => {
  const [sortField, setSortField] = useState<keyof CardItem>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const columnMap = columns.reduce((acc, c) => {
    acc[c.id] = c.title;
    return acc;
  }, {} as Record<string, string>);

  const handleSort = (field: keyof CardItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedCards = [...cards].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === undefined) return 1;
    if (valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 rounded-md">Urgent</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-md">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider bg-blue-50 text-blue-700 rounded-md">Medium</span>;
      case 'low':
        return <span className="px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md">Low</span>;
    }
  };

  return (
    <div id="table-view-container" className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-800">
            {cards.length} Tasks Listed
          </div>
          <button
            onClick={() => onOpenNewCard()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">
                    <span>Task Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Status / List</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Assignees</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4">Checklist</th>
                <th className="py-3 px-4">Labels</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedCards.map(card => {
                const totalChecklist = card.checklist?.length || 0;
                const completedChecklist = card.checklist?.filter(c => c.completed).length || 0;

                return (
                  <tr 
                    key={card.id}
                    onClick={() => onOpenCard(card)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Title */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        {card.coverColor && (
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: card.coverColor }}
                          />
                        )}
                        <span className="line-clamp-1">{card.title}</span>
                      </div>
                    </td>

                    {/* Column / Status */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">
                        {columnMap[card.columnId] || card.columnId}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      {getPriorityBadge(card.priority)}
                    </td>

                    {/* Assignees */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center -space-x-1.5">
                        {card.assignees?.map(u => (
                          <img
                            key={u.id}
                            src={u.avatar}
                            alt={u.name}
                            title={u.name}
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {card.dueDate ? (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Calendar size={12} className="text-slate-400" />
                          {card.dueDate}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Checklist */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {totalChecklist > 0 ? (
                        <span className="flex items-center gap-1">
                          <CheckSquare size={12} className="text-slate-400" />
                          {completedChecklist}/{totalChecklist}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Labels */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {card.labels?.map(l => (
                          <span
                            key={l.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${l.bg} ${l.text}`}
                          >
                            {l.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCard(card);
                        }}
                        className="text-slate-400 hover:text-blue-600 p-1"
                      >
                        <ExternalLink size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedCards.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No tasks found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
