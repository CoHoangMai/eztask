import React from 'react';
import { 
  Plus, 
  Layout, 
  Code, 
  Megaphone, 
  DollarSign, 
  Palette, 
  UserCheck, 
  Lock,
  Sparkles,
  Layers,
  Info,
  FolderPlus,
  ArrowRight
} from 'lucide-react';
import type { Workspace, WorkspaceRole } from '../types/kanban';
import { BOARD_TEMPLATES } from '../data/initialKanbanData';

interface EmptyBoardViewProps {
  currentWorkspace: Workspace;
  currentUserRole: WorkspaceRole;
  onCreateBoard: (title: string, category: any, templateId?: string) => void;
  onOpenCreateModal: () => void;
}

export const EmptyBoardView: React.FC<EmptyBoardViewProps> = ({
  currentWorkspace,
  currentUserRole,
  onCreateBoard,
  onOpenCreateModal
}) => {
  const isGuest = currentUserRole === 'guest';

  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code size={20} className="text-blue-500" />;
      case 'Megaphone': return <Megaphone size={20} className="text-pink-500" />;
      case 'DollarSign': return <DollarSign size={20} className="text-emerald-500" />;
      case 'Palette': return <Palette size={20} className="text-purple-500" />;
      case 'UserCheck': return <UserCheck size={20} className="text-amber-500" />;
      default: return <Layout size={20} className="text-slate-500" />;
    }
  };

  if (isGuest) {
    return (
      <div 
        id="empty-board-guest-restricted"
        className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900/40 text-center select-none"
      >
        <div className="max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4 shadow-inner">
            <Lock size={32} />
          </div>

          <h2 className="text-lg font-bold text-white mb-2">
            No Boards Shared With You
          </h2>
          
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Your guest account in <strong className="text-slate-200">{currentWorkspace.name}</strong> currently has no assigned boards. Guest access requires explicit board permissions.
          </p>

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs text-slate-400 text-left">
            <Info size={16} className="text-blue-400 shrink-0" />
            <span>Contact a workspace Owner or Administrator to be granted board access.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="empty-board-state-view"
      className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-900/30 flex flex-col items-center justify-start text-center select-none"
    >
      <div className="max-w-3xl w-full my-auto py-8 flex flex-col items-center">
        {/* Workspace Badge */}
        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-5 shadow-lg shadow-blue-600/5 font-bold text-lg">
          {currentWorkspace.logo ? (
            <span>{currentWorkspace.logo}</span>
          ) : (
            <FolderPlus size={28} />
          )}
        </div>

        {/* Heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2">
          No Boards in "{currentWorkspace.name}"
        </h1>
        
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mb-8 leading-relaxed">
          Get started by setting up your team's workflow. Create a custom board or choose a pre-configured template below to launch instantly.
        </p>

        {/* Primary CTA Button */}
        <div className="flex items-center gap-3 mb-10">
          <button
            id="empty-state-create-board-btn"
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Create Custom Board</span>
          </button>
        </div>

        {/* Templates Quick Start Grid */}
        <div className="w-full text-left">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick start with a workflow template:
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {BOARD_TEMPLATES.map(tpl => (
              <div 
                key={tpl.id}
                onClick={() => onCreateBoard(tpl.name, tpl.category, tpl.id)}
                className="group p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-blue-900/10 text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-blue-600/20 transition-colors">
                      {getTemplateIcon(tpl.iconName)}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors">
                      {tpl.category}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {tpl.name}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers size={11} className="text-slate-500" />
                    {tpl.defaultColumns.length} columns
                  </span>
                  <span className="text-blue-400 font-semibold group-hover:text-blue-300 flex items-center gap-1">
                    Use template <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
