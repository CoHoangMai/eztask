import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Users, 
  Check, 
  Crown, 
  ShieldCheck, 
  User as UserIcon, 
  Eye, 
  X
} from 'lucide-react';
import type { Workspace, WorkspaceRole, Assignee } from '../types/kanban';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentUser: Assignee;
  onSelectWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: (name: string, description: string, logo: string) => void;
  onOpenMembersModal: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  workspaces,
  currentWorkspace,
  currentUser,
  onSelectWorkspace,
  onCreateWorkspace,
  onOpenMembersModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [newWsLogo, setNewWsLogo] = useState('WS');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserRoleInWs = (ws: Workspace | null): WorkspaceRole => {
    if (!ws || !ws.members) return 'guest';
    const member = ws.members.find(m => m.userId === currentUser.id);
    if (!member) {
      if (ws.ownerId === currentUser.id) return 'owner';
      return 'guest';
    }
    return member.role;
  };

  const currentRole = getUserRoleInWs(currentWorkspace);

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-0.5"><Crown size={9} /> Owner</span>;
      case 'admin':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-0.5"><ShieldCheck size={9} /> Admin</span>;
      case 'member':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5"><UserIcon size={9} /> Member</span>;
      case 'guest':
        return <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-0.5"><Eye size={9} /> Guest</span>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const generatedLogo = newWsLogo.trim() || newWsName.trim().slice(0, 2).toUpperCase() || 'WS';
    onCreateWorkspace(newWsName.trim(), newWsDesc.trim(), generatedLogo);
    setNewWsName('');
    setNewWsDesc('');
    setNewWsLogo('WS');
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        id="workspace-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer shadow-xs max-w-[240px] sm:max-w-[280px]"
      >
        <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
          {currentWorkspace ? (currentWorkspace.logo || 'WS') : <Building2 size={13} />}
        </span>
        <div className="text-left min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white truncate leading-tight">
              {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {currentWorkspace ? (
              <>
                {getRoleBadge(currentRole)}
                <span className="text-[10px] text-slate-400 truncate">
                  {currentWorkspace.members?.length || 0} members
                </span>
              </>
            ) : (
              <span className="text-[10px] text-slate-400 truncate">
                {workspaces.length} available
              </span>
            )}
          </div>
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95">
          {!isCreating ? (
            <>
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Your Workspaces ({workspaces.length})
                  </span>
                  <p className="text-[10px] text-slate-500">Zero-trust isolated organizations</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="p-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Create New Organization"
                >
                  <Plus size={13} />
                  <span className="text-[10px]">New</span>
                </button>
              </div>

              {/* Workspaces List */}
              <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                {workspaces.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No accessible workspaces found.
                  </div>
                ) : (
                  workspaces.map((ws) => {
                    const isSelected = currentWorkspace ? ws.id === currentWorkspace.id : false;
                    const role = getUserRoleInWs(ws);
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          onSelectWorkspace(ws);
                          setIsOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-950/60 border-blue-500/50 shadow-xs'
                            : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold shrink-0">
                            {ws.logo || 'WS'}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">{ws.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {getRoleBadge(role)}
                              <span className="text-[10px] text-slate-500">
                                {ws.members?.length || 0} members
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={!currentWorkspace}
                  onClick={() => {
                    if (currentWorkspace) {
                      onOpenMembersModal();
                      setIsOpen(false);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-800"
                >
                  <Users size={13} className="text-blue-400" />
                  <span>Members & Access</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  <Plus size={13} />
                  <span>New Workspace</span>
                </button>
              </div>
            </>
          ) : (
            /* Create Workspace Sub-form */
            <form onSubmit={handleCreateSubmit} className="p-2 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-400" />
                  Create New Workspace
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-md"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Logo</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newWsLogo}
                    onChange={(e) => setNewWsLogo(e.target.value)}
                    className="w-full text-center py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp, Design Studio"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Primary objective, team focus..."
                  value={newWsDesc}
                  onChange={(e) => setNewWsDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newWsName.trim()}
                  className="px-4 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
