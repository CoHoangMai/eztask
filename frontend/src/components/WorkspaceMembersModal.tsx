import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User as UserIcon, 
  Eye, 
  Trash2, 
  Check, 
  Settings, 
  Lock
} from 'lucide-react';
import type { Workspace, WorkspaceRole, Assignee, Board } from '../types/kanban';

interface WorkspaceMembersModalProps {
  workspace: Workspace | null;
  allUsers: Assignee[];
  workspaceBoards: Board[];
  currentUser: Assignee;
  currentUserRole: WorkspaceRole;
  onClose: () => void;
  onUpdateWorkspace: (updated: Workspace) => void;
  onInviteMember: (email: string, role: WorkspaceRole, allowedBoardIds?: string[]) => void;
  onRemoveMember: (userId: string) => void;
  onChangeMemberRole: (userId: string, newRole: WorkspaceRole, allowedBoardIds?: string[]) => void;
}

export const WorkspaceMembersModal: React.FC<WorkspaceMembersModalProps> = ({
  workspace,
  allUsers,
  workspaceBoards,
  currentUser,
  currentUserRole,
  onClose,
  onUpdateWorkspace,
  onInviteMember,
  onRemoveMember,
  onChangeMemberRole,
}) => {
  if (!workspace) return null;

  const [activeTab, setActiveTab] = useState<'members' | 'settings'>('members');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [inviteAllowedBoards, setInviteAllowedBoards] = useState<string[]>([]);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Settings tab form
  const [wsName, setWsName] = useState(workspace.name);
  const [wsLogo, setWsLogo] = useState(workspace.logo || 'WS');
  const [wsDescription, setWsDescription] = useState(workspace.description || '');

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin';

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmittingInvite(true);
    onInviteMember(
      inviteEmail.trim(), 
      inviteRole, 
      inviteRole === 'guest' ? inviteAllowedBoards : undefined
    );

    setInviteEmail('');
    setInviteRole('member');
    setInviteAllowedBoards([]);
    setIsSubmittingInvite(false);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;

    onUpdateWorkspace({
      ...workspace,
      name: wsName.trim(),
      logo: wsLogo.trim(),
      description: wsDescription.trim(),
    });
  };

  const toggleAllowedBoard = (boardId: string) => {
    if (inviteAllowedBoards.includes(boardId)) {
      setInviteAllowedBoards(inviteAllowedBoards.filter(id => id !== boardId));
    } else {
      setInviteAllowedBoards([...inviteAllowedBoards, boardId]);
    }
  };

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Crown size={10} /> Owner</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1"><Shield size={10} /> Admin</span>;
      case 'member':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><UserIcon size={10} /> Member</span>;
      case 'guest':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Eye size={10} /> Guest </span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs select-none">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-sm font-bold shadow-inner">
              {workspace.logo || 'WS'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{workspace.name}</h3>
                {getRoleBadge(currentUserRole)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Workspace Tenant Management & Access Control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 gap-4">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users size={14} />
            <span>Members & Roles ({workspace.members.length})</span>
          </button>

          {canManageMembers && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={14} />
              <span>Workspace Settings</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {activeTab === 'members' ? (
            <>
              {/* Invite Section (Admins/Owners only) */}
              {canManageMembers ? (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <UserPlus size={14} className="text-blue-400" />
                      Invite Member or External Guest
                    </span>
                    <span className="text-[10px] text-slate-400">Scale-ready RBAC</span>
                  </div>

                  <form onSubmit={handleInviteSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-7">
                        <input
                          type="email"
                          required
                          placeholder="colleague@company.com or external.guest@client.io"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="member">Member (Full Workspace Access)</option>
                          <option value="admin">Admin (Manage Members & Boards)</option>
                          <option value="guest">Guest (Single-Board Specific)</option>
                        </select>
                      </div>
                    </div>

                    {/* If Guest: Select Allowed Boards */}
                    {inviteRole === 'guest' && (
                      <div className="p-3 bg-slate-900/90 border border-purple-900/40 rounded-xl space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5">
                            <Lock size={12} />
                            Grant access to specific board(s) for this Guest:
                          </label>
                          <span className="text-[10px] text-slate-400">Guest cannot see other boards</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                          {workspaceBoards.map(board => {
                            const isChecked = inviteAllowedBoards.includes(board.id);
                            return (
                              <button
                                key={board.id}
                                type="button"
                                onClick={() => toggleAllowedBoard(board.id)}
                                className={`p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  isChecked
                                    ? 'bg-purple-950/60 border-purple-500/70 text-purple-200'
                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <span className="truncate pr-2">{board.title}</span>
                                {isChecked && <Check size={12} className="text-purple-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmittingInvite || !inviteEmail.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                      >
                        <UserPlus size={13} />
                        <span>Send Invite</span>
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <Shield size={14} className="text-slate-500" />
                  <span>Only Workspace Owners & Admins can invite new members or change permissions.</span>
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Workspace Members ({workspace.members.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Created {new Date(workspace.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {workspace.members.map((member) => {
                    const user = allUsers.find(u => u.id === member.userId) || {
                      id: member.userId,
                      name: 'Workspace User',
                      email: 'user@workspace.io',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
                      role: 'Collaborator'
                    };

                    const isOwner = member.role === 'owner';
                    const isSelf = member.userId === currentUser.id;

                    return (
                      <div
                        key={member.userId}
                        className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{user.name}</span>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                            {member.role === 'guest' && member.allowedBoardIds && (
                              <p className="text-[10px] text-purple-400 mt-0.5 flex items-center gap-1">
                                <Lock size={10} />
                                Access to {member.allowedBoardIds.length} designated board(s)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {canManageMembers && !isOwner && !isSelf ? (
                            <select
                              value={member.role}
                              onChange={(e) => onChangeMemberRole(member.userId, e.target.value as WorkspaceRole)}
                              className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="guest">Guest</option>
                            </select>
                          ) : (
                            getRoleBadge(member.role)
                          )}

                          {canManageMembers && !isOwner && !isSelf && (
                            <button
                              onClick={() => onRemoveMember(member.userId)}
                              title="Remove from Workspace"
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Workspace Settings Tab */
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Workspace Icon</label>
                  <input
                    type="text"
                    value={wsLogo}
                    onChange={(e) => setWsLogo(e.target.value)}
                    maxLength={4}
                    className="w-full px-3 py-2 text-center text-lg bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Workspace Name *</label>
                  <input
                    type="text"
                    required
                    value={wsName}
                    onChange={(e) => setWsName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Description & Purpose</label>
                <textarea
                  rows={3}
                  value={wsDescription}
                  onChange={(e) => setWsDescription(e.target.value)}
                  placeholder="Describe your company or organization..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-md shadow-blue-600/20"
                >
                  Save Workspace Changes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
