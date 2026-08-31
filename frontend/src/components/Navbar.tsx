import React from 'react';
import { 
  Kanban, 
  Users,
  Cloud,
  CloudOff,
} from 'lucide-react';
import type { Assignee, Workspace, WorkspaceRole } from '../types/kanban';
import { NotificationCenter } from './NotificationCenter';
import { UserDropdown } from './UserDropdown';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface NavbarProps {
  currentUser: Assignee;
  availableUsers?: Assignee[];
  activeBoardTitle: string;
  isOnline?: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  currentUserRole: WorkspaceRole;
  onSelectWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: (name: string, description: string, logo: string) => void;
  onOpenMembersModal: () => void;
  onOpenProfileView: () => void;
  onSelectUser: (user: Assignee) => void;
  onLogout: () => void;
  onNavigateToCard?: (cardId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  availableUsers,
  activeBoardTitle,
  isOnline = false,
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onCreateWorkspace,
  onOpenMembersModal,
  onOpenProfileView,
  onSelectUser,
  onLogout,
  onNavigateToCard
}) => {
  return (
    <header id="main-navbar" className="bg-slate-950 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-xs select-none">
      {/* Left: Brand & Workspace Switcher */}
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        {/* Brand Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
            <Kanban size={18} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white hidden md:inline">
            EzTask
          </span>
        </div>

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Multi-Tenant Workspace Selector */}
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          currentUser={currentUser}
          onSelectWorkspace={onSelectWorkspace}
          onCreateWorkspace={onCreateWorkspace}
          onOpenMembersModal={onOpenMembersModal}
        />

        {/* Active Board Breadcrumb */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 min-w-0">
          <span className="text-slate-600">/</span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-medium truncate max-w-[180px]">
            {activeBoardTitle}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Workspace Members Quick Button */}
        <button
          id="navbar-members-btn"
          onClick={onOpenMembersModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-800 transition-colors cursor-pointer"
          title="Manage Workspace Organization & Members"
        >
          <Users size={14} className="text-blue-400" />
          <span className="hidden sm:inline">Workspace Access</span>
        </button>

        {/* Sync Status Badge */}
        <div
          id="workspace-sync-status-badge"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300"
        >
          {isOnline ? (
            <>
              <Cloud size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Live Sync</span>
            </>
          ) : (
            <>
              <CloudOff size={13} className="text-slate-400" />
              <span className="text-slate-400">Offline (Local Workspace)</span>
            </>
          )}
        </div>

        {/* Notifications */}
        <NotificationCenter isOnline={isOnline} onNavigateToCard={onNavigateToCard} />

        {/* User Persona & Profile Controls */}
        <UserDropdown 
          currentUser={currentUser}
          availableUsers={availableUsers}
          onSelectUser={onSelectUser}
          onOpenProfileView={onOpenProfileView}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};
