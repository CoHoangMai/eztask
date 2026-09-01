import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Save, 
  ArrowLeft, 
  CheckCircle2,
  Users,
  Briefcase,
  Building,
  Crown,
  ShieldCheck,
  User as UserIcon,
  Eye,
  Check,
  Lock
} from 'lucide-react';
import type { Assignee, Team, Workspace, WorkspaceRole } from '../types/kanban';

interface ProfileViewProps {
  currentUser: Assignee;
  allUsers: Assignee[];
  teams: Team[];
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onUpdateUser: (updatedUser: Assignee) => void;
  onBackToBoard: () => void;
  onSwitchUser: (user: Assignee) => void;
  onSelectWorkspace: (workspace: Workspace) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  workspaces,
  currentWorkspace,
  onUpdateUser,
  onBackToBoard,
  onSelectWorkspace,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [role, setRole] = useState(currentUser.role || 'Project Lead');
  const [department, setDepartment] = useState(currentUser.department || 'General');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when currentUser persona switches
  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email || '');
    setRole(currentUser.role || 'Project Lead');
    setDepartment(currentUser.department || 'General');
    setAvatar(currentUser.avatar);
    setSavedSuccess(false);
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Assignee = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department: department.trim(),
      avatar: avatar.trim(),
    };

    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const getUserRoleInWs = (ws: Workspace | null | undefined, userId: string): WorkspaceRole => {
    if (!ws) return 'guest';
    if (ws.ownerId === userId) return 'owner';
    const member = ws.members?.find(m => m.userId === userId);
    return member ? member.role : 'guest';
  };

  const getRoleBadge = (role: WorkspaceRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Crown size={10} /> Owner</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30 flex items-center gap-1"><ShieldCheck size={10} /> Admin</span>;
      case 'member':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><UserIcon size={10} /> Member</span>;
      case 'guest':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Eye size={10} /> Guest (Limited)</span>;
    }
  };

  // Filter workspaces this user is member or owner of
  const userWorkspaces = workspaces.filter(ws => ws.ownerId === currentUser.id || ws.members.some(m => m.userId === currentUser.id));

  return (
    <div id="profile-view" className="flex-1 bg-slate-900 overflow-y-auto p-4 sm:p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            id="profile-back-to-board-btn"
            onClick={onBackToBoard}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Workspace {currentWorkspace ? `(${currentWorkspace.name})` : ''}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Account Profile & Multi-Tenant Access</span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Header */}
          <div className="h-28 bg-linear-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 p-6 flex items-end">
            <div className="flex items-center gap-4 translate-y-8">
              <img
                src={avatar}
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-950 shadow-xl"
              />
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-blue-400 font-semibold">{role}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-300 font-medium">{department}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">{currentUser.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <form onSubmit={handleSave} className="pt-12 p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={14} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail size={14} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Custom Role Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Role Title (Domain Agnostic)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Briefcase size={14} />
                  </div>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Chief Architect, Creative Director, Head of Sales"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Primary Department / Expertise
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Users size={14} />
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Engineering, Design, Operations, Sales"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* User's Multi-Tenant Workspaces (Real-world SaaS Scale) */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Building size={14} className="text-blue-400" />
                  <span>Organizations & Workspaces You Belong To ({userWorkspaces.length})</span>
                </label>
                <span className="text-[10px] text-slate-500">1 Account, Multi-Organization Access</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {userWorkspaces.map(ws => {
                  const roleInWs = getUserRoleInWs(ws, currentUser.id);
                  const isCurrent = currentWorkspace ? ws.id === currentWorkspace.id : false;
                  const memberData = ws.members.find(m => m.userId === currentUser.id);

                  return (
                    <div
                      key={ws.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500/60 ring-1 ring-blue-500/30'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {ws.logo || 'WS'}
                            </span>
                            <span className="text-xs font-bold text-white truncate max-w-[140px]">{ws.name}</span>
                          </div>
                          {getRoleBadge(roleInWs)}
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2">{ws.description}</p>
                        {roleInWs === 'guest' && memberData?.allowedBoardIds && (
                          <div className="mt-1.5 text-[9px] text-purple-400 flex items-center gap-1">
                            <Lock size={10} />
                            <span>Access limited to {memberData.allowedBoardIds.length} board(s)</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{ws.members.length} team members</span>
                        {isCurrent ? (
                          <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                            <Check size={12} /> Active Workspace
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectWorkspace(ws);
                              onBackToBoard();
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Switch to this
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {savedSuccess ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold animate-in fade-in">
                  <CheckCircle2 size={16} />
                  <span>Profile details updated successfully!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">Changes immediately persist in cloud state.</span>
              )}

              <button
                id="profile-save-btn"
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <Save size={14} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* Account & Session Security Overview */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                Account Security & Session
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage your active workspace session and security status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-semibold text-white">Active Session</div>
              <div className="text-[11px] text-slate-400 mt-1">Authenticated via JWT Token</div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active & Verified
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xs font-semibold text-white">Current Workspace Role</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {currentWorkspace ? `Role in "${currentWorkspace.name}"` : 'General access'}
              </div>
              <div className="mt-2">
                {currentWorkspace ? getRoleBadge(getUserRoleInWs(currentWorkspace, currentUser.id)) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">Member</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
