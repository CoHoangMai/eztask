import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
} from 'lucide-react';
import type { CardItem } from '../types/kanban';

interface CalendarViewProps {
  cards: CardItem[];
  onOpenCard: (card: CardItem) => void;
  onOpenNewCard: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cards = [],
  onOpenCard,
  onOpenNewCard
}) => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-08-20'));

  const safeCards = cards || [];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group cards by day string YYYY-MM-DD
  const cardsByDate = safeCards.reduce((acc, card) => {
    if (card.dueDate) {
      if (!acc[card.dueDate]) acc[card.dueDate] = [];
      acc[card.dueDate].push(card);
    }
    return acc;
  }, {} as Record<string, CardItem[]>);

  // Generate calendar grid slots
  const days = [];
  // Empty slots for days before start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }

  const formatDayKey = (dayNumber: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNumber).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  return (
    <div id="calendar-view-container" className="flex-1 overflow-auto p-6 bg-slate-50">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 max-w-7xl mx-auto">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={onOpenNewCard}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
          >
            <Plus size={14} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Grid of Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            if (day === null) {
              return (
                <div 
                  key={`empty-${idx}`} 
                  className="min-h-[110px] bg-slate-50/50 rounded-xl border border-dashed border-slate-200/50" 
                />
              );
            }

            const dateKey = formatDayKey(day);
            const dayCards = cardsByDate[dateKey] || [];
            const isToday = dateKey === '2026-08-20';

            return (
              <div
                key={dateKey}
                className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col ${
                  isToday 
                    ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-300' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  {dayCards.length > 0 && (
                    <span className="text-[10px] font-semibold text-slate-400">
                      {dayCards.length} {dayCards.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 max-h-24">
                  {dayCards.map(c => (
                    <div
                      key={c.id}
                      onClick={() => onOpenCard(c)}
                      className="p-1.5 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-blue-100 hover:text-blue-900 cursor-pointer text-slate-800 truncate transition-colors border border-slate-200/60"
                      title={c.title}
                    >
                      <span className="line-clamp-1">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
