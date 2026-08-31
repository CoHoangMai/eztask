import React, { useState } from 'react';
import { 
  X, 
  Layout, 
  Code, 
  Megaphone, 
  DollarSign, 
  Palette, 
  UserCheck, 
  CalendarCheck 
} from 'lucide-react';
import type { Board, Team, Workspace } from '../types/kanban';
import { BOARD_TEMPLATES, type BoardTemplate } from '../data/initialKanbanData';

interface CreateBoardModalProps {
  currentWorkspace: Workspace;
  teams: Team[];
  onClose: () => void;
  onCreateBoard: (title: string, category: Board['category'], templateId?: string, teamId?: string) => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  currentWorkspace,
  teams,
  onClose,
  onCreateBoard
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate>(BOARD_TEMPLATES[0]);
  const [title, setTitle] = useState(BOARD_TEMPLATES[0].name);
  const [category, setCategory] = useState<Board['category']>(BOARD_TEMPLATES[0].category);
  const [teamId, setTeamId] = useState<string>('');

  const handleSelectTemplate = (tpl: BoardTemplate) => {
    setSelectedTemplate(tpl);
    setTitle(tpl.name);
    setCategory(tpl.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateBoard(title.trim(), category, selectedTemplate.id, teamId || undefined);
    onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Layout size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Create Board in {currentWorkspace.name}
              </h3>
              <p className="text-xs text-slate-500">
                Select a workflow template or start with a custom blank layout
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Template Selection Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Workflow Template
            </label>
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sprint 43 Core Platform"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Assign to Team (Optional)</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
              >
                <option value="">General (Entire Workspace)</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
