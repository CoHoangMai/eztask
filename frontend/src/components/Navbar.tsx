import React from 'react';
import { 
  Kanban, 
  Users,
  Server
} from 'lucide-react';
import type { Assignee } from '../types/kanban';

interface NavbarProps {
  currentUser: Assignee;
  activeBoardTitle: string;
  isOnline?: boolean;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeBoardTitle,
  isOnline = false,
  onOpenAuthModal
}) => {
  return (
    <header id="main-navbar" className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-xs select-none">
      {/* Brand & Left controls */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
            <Kanban size={18} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
            eztask <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">Pro</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200">
            Workspaces
          </span>
          <span className="text-slate-500">/</span>
          <span className="px-2.5 py-1 rounded-md text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer">
            {activeBoardTitle}
          </span>
        </div>
      </div>

      {/* Right User & Utility Controls */}
      <div className="flex items-center gap-3">
        {/* Gateway Architecture Indicator */}
        <button
          onClick={onOpenAuthModal}
          title="Spring Cloud Gateway Status & IAM Auth"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] font-medium transition-colors"
        >
          <Server size={12} className="text-slate-400" />
          <span className="text-slate-300">Gateway:</span>
          {isOnline ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          ) : (
            <span className="text-amber-300 font-semibold">Demo Mode</span>
          )}
        </button>

        {/* Active team avatars */}
        <div className="hidden lg:flex items-center -space-x-2 mr-1">
          <span className="text-[11px] text-slate-400 mr-3 flex items-center gap-1">
            <Users size={13} /> Active:
          </span>
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
            alt="User" 
            className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover" 
            title="Alex Johnson"
          />
          <img 
            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80" 
            alt="User" 
            className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover" 
            title="Sarah Chen"
          />
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
            alt="User" 
            className="w-6 h-6 rounded-full ring-2 ring-slate-900 object-cover" 
            title="Michael Miller"
          />
        </div>

        {/* User Profile button */}
        <button 
          onClick={onOpenAuthModal}
          title="Account profile, JWT authentication & switch user"
          className="flex items-center gap-2.5 pl-2 border-l border-slate-800 hover:bg-slate-800/60 py-1 px-2 rounded-lg transition-colors text-left"
        >
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500"
          />
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-white leading-tight">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
          </div>
        </button>
      </div>
    </header>
  );
};
