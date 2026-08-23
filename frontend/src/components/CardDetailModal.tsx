import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Check, 
  Copy,
  Sparkles
} from 'lucide-react';
import type { CardItem, Column, Assignee, Label, Priority, ChecklistItem } from '../types/kanban';
import { generateClientSubtasks } from '../utils/aiHelper';

interface CardDetailModalProps {
  card: CardItem;
  columns: Column[];
  availableLabels: Label[];
  availableAssignees: Assignee[];
  currentUser: Assignee;
  onClose: () => void;
  onUpdateCard: (updatedCard: CardItem) => void;
  onDeleteCard: (cardId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  columns,
  availableLabels,
  availableAssignees,
  currentUser,
  onClose,
  onUpdateCard,
  onDeleteCard
}) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate || '');
  const [estimatedHours, setEstimatedHours] = useState<number | undefined>(card.estimatedHours);
  const [coverColor, setCoverColor] = useState<string | undefined>(card.coverColor);
  const [selectedColumnId, setSelectedColumnId] = useState(card.columnId);

  // Checklists
  const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Comments
  const [comments, setComments] = useState(card.comments || []);
  const [newCommentText, setNewCommentText] = useState('');

  // Labels & Assignees
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(card.labels || []);
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(card.assignees || []);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleGenerateAISubtasks = async () => {
    setIsGeneratingSubtasks(true);
    try {
      // Attempt backend API if running
      const res = await fetch('/api/ai/generate-subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, taskDescription: description })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subtasks && Array.isArray(data.subtasks)) {
          const newItems: ChecklistItem[] = data.subtasks.map((text: string, idx: number) => ({
            id: `chk-ai-${Date.now()}-${idx}`,
            text,
            completed: false
          }));
          setChecklist(prev => [...prev, ...newItems]);
          setIsGeneratingSubtasks(false);
          return;
        }
      }
    } catch {
      // Backend not running in client-only mode, fall through to client generator
    }

    // Client-side smart subtask generator
    const subtaskTexts = generateClientSubtasks(title);
    const newItems: ChecklistItem[] = subtaskTexts.map((text: string, idx: number) => ({
      id: `chk-ai-${Date.now()}-${idx}`,
      text,
      completed: false
    }));
    setChecklist(prev => [...prev, ...newItems]);
    setIsGeneratingSubtasks(false);
  };

  const handleSave = () => {
    onUpdateCard({
      ...card,
      title: title.trim() || card.title,
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
      estimatedHours: estimatedHours || undefined,
      coverColor,
      columnId: selectedColumnId,
      checklist,
      comments,
      labels: selectedLabels,
      assignees: selectedAssignees,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const newItem: ChecklistItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false
    };
    const nextChecklist = [...checklist, newItem];
    setChecklist(nextChecklist);
    setNewChecklistText('');

    // Auto-sync updated checklist to card
    onUpdateCard({
      ...card,
      checklist: nextChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const toggleChecklistItem = (id: string) => {
    const nextChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(nextChecklist);

    // Auto-sync checklist state immediately so automations trigger without delay
    onUpdateCard({
      ...card,
      checklist: nextChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const deleteChecklistItem = (id: string) => {
    const nextChecklist = checklist.filter(item => item.id !== id);
    setChecklist(nextChecklist);

    // Auto-sync checklist state
    onUpdateCard({
      ...card,
      checklist: nextChecklist,
      updatedAt: new Date().toISOString()
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      author: currentUser,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setComments([...comments, newComment]);
    setNewCommentText('');
  };

  const toggleLabel = (label: Label) => {
    const exists = selectedLabels.some(l => l.id === label.id);
    if (exists) {
      setSelectedLabels(selectedLabels.filter(l => l.id !== label.id));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const toggleAssignee = (user: Assignee) => {
    const exists = selectedAssignees.some(u => u.id === user.id);
    if (exists) {
      setSelectedAssignees(selectedAssignees.filter(u => u.id !== user.id));
    } else {
      setSelectedAssignees([...selectedAssignees, user]);
    }
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  const colorPalette = [
    { label: 'None', value: undefined },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Purple', value: '#7c3aed' },
    { label: 'Pink', value: '#db2777' },
    { label: 'Amber', value: '#d97706' },
    { label: 'Emerald', value: '#059669' },
    { label: 'Red', value: '#dc2626' }
  ];

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="card-detail-modal-box"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
      >
        {/* Cover Bar */}
        {coverColor && (
          <div className="h-3 w-full" style={{ backgroundColor: coverColor }} />
        )}

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-xl font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 rounded transition-colors"
              placeholder="Task title..."
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 px-1">
              <span>in list</span>
              <select
                value={selectedColumnId}
                onChange={e => setSelectedColumnId(e.target.value)}
                className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border-none focus:ring-1 focus:ring-blue-500"
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy task link"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {copiedLink ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this task?')) {
                  onDeleteCard(card.id);
                  onClose();
                }
              }}
              title="Delete task"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Add more detailed notes or requirements..."
                className="w-full text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed"
              />
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-slate-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Checklist</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateAISubtasks}
                    disabled={isGeneratingSubtasks}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors disabled:opacity-50"
                    title="Generate actionable subtasks with AI"
                  >
                    <Sparkles size={12} className={isGeneratingSubtasks ? "animate-spin" : "text-amber-500"} />
                    <span>{isGeneratingSubtasks ? 'Generating...' : 'AI Subtasks'}</span>
                  </button>
                  {checklist.length > 0 && (
                    <span className="text-xs font-semibold text-slate-500">{progressPercent}%</span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {checklist.length > 0 && (
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Checklist items */}
              <div className="space-y-1.5 mb-3">
                {checklist.map(item => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 group transition-colors"
                  >
                    <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item.text}
                      </span>
                    </label>
                    <button
                      onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a step or subtask..."
                  value={newChecklistText}
                  onChange={e => setNewChecklistText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newChecklistText.trim()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Comments & Discussion */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={16} className="text-slate-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Discussion</span>
              </div>

              {/* Comments stream */}
              <div className="space-y-3 mb-4">
                {comments.map(comm => (
                  <div key={comm.id} className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <img 
                      src={comm.author.avatar} 
                      alt={comm.author.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{comm.author.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{comm.text}</p>
                    </div>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No comments yet. Start the conversation below.
                  </div>
                )}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar Attributes (1/3 width) */}
          <div className="space-y-6 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
            {/* Priority */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Priority
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as Priority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border text-center transition-all ${
                      priority === p 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date & Estimate */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Due Date & Hours
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Est. Hours"
                    value={estimatedHours ?? ''}
                    onChange={e => setEstimatedHours(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Labels
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableLabels.map(lbl => {
                  const isSelected = selectedLabels.some(l => l.id === lbl.id);
                  return (
                    <button
                      key={lbl.id}
                      type="button"
                      onClick={() => toggleLabel(lbl)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        isSelected
                          ? `${lbl.bg} ${lbl.text} ${lbl.border} ring-2 ring-blue-500 shadow-xs`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lbl.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Assignees
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {availableAssignees.map(u => {
                  const isSelected = selectedAssignees.some(a => a.id === u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleAssignee(u)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cover Accent */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Color Accent
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {colorPalette.map(color => (
                  <button
                    key={color.label}
                    type="button"
                    onClick={() => setCoverColor(color.value)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      coverColor === color.value ? 'ring-2 ring-blue-500 scale-110' : 'border-white'
                    } ${!color.value ? 'bg-slate-200 border-slate-300' : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
