import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  UserPlus, 
  Trash2, 
  Check, 
  Briefcase, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import type { Assignee, Team, UserRoleLevel } from '../types/kanban';

interface TeamManagementModalProps {
  teams: Team[];
  users: Assignee[];
  currentUser: Assignee;
  onClose: () => void;
  onCreateTeam: (team: Omit<Team, 'id'>) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddUser: (user: Omit<Assignee, 'id'>) => void;
}

const TEAM_PRESET_COLORS = [
  '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#f43f5e'
];

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  teams,
  users,
  currentUser,
  onClose,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddUser,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams');

  // New Team Form State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamColor, setTeamColor] = useState(TEAM_PRESET_COLORS[0]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // New Member Form State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDepartment, setMemberDepartment] = useState('');
  const [memberRoleLevel, setMemberRoleLevel] = useState<UserRoleLevel>('member');
  const [memberAvatar, setMemberAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80');
  const [memberTeamIds, setMemberTeamIds] = useState<string[]>([]);

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    onCreateTeam({
      name: teamName.trim(),
      description: teamDescription.trim(),
      color: teamColor,
      memberIds: selectedMemberIds,
    });

    setTeamName('');
    setTeamDescription('');
    setSelectedMemberIds([]);
    setIsCreatingTeam(false);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    onAddUser({
      name: memberName.trim(),
      email: memberEmail.trim(),
      role: memberRole.trim() || 'Team Specialist',
      department: memberDepartment.trim() || 'General',
      roleLevel: memberRoleLevel,
      avatar: memberAvatar.trim(),
      teamIds: memberTeamIds,
    });

    setMemberName('');
    setMemberEmail('');
    setMemberRole('');
    setMemberDepartment('');
    setMemberTeamIds([]);
    setIsAddingMember(false);
  };

  const toggleTeamMemberSelection = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const toggleMemberTeamSelection = (teamId: string) => {
    if (memberTeamIds.includes(teamId)) {
      setMemberTeamIds(memberTeamIds.filter(id => id !== teamId));
    } else {
      setMemberTeamIds([...memberTeamIds, teamId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div 
        id="team-management-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Workspace Teams & Organization</h3>
              <p className="text-xs text-slate-500">Manage cross-functional squads, departments, and workspace members</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'teams'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers size={14} />
            <span>Teams & Departments ({teams.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Workspace Members ({users.length})</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'teams' ? (
            <>
              {/* Teams Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Functional Teams
                  </h4>
                  <p className="text-xs text-slate-400">Members can participate across multiple teams simultaneously</p>
                </div>
                {!isCreatingTeam && (
                  <button
                    onClick={() => setIsCreatingTeam(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <Plus size={14} />
                    <span>Create Team</span>
                  </button>
                )}
              </div>

              {/* Create Team Inline Form */}
              {isCreatingTeam && (
                <form 
                  onSubmit={handleCreateTeamSubmit}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">New Functional Team</span>
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingTeam(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Team Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Growth & Marketing, Creative Studio, Revenue Team"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Accent Color</label>
                      <div className="flex items-center gap-2 mt-1">
                        {TEAM_PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setTeamColor(c)}
                            className={`w-6 h-6 rounded-full transition-transform ${
                              teamColor === c ? 'ring-2 ring-slate-900 scale-110' : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Description / Focus Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Campaign rollouts, asset generation, client pipelines"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Assign Initial Members</label>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white border border-slate-200 rounded-xl">
                      {users.map(u => {
                        const isSelected = selectedMemberIds.includes(u.id);
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => toggleTeamMemberSelection(u.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                            <span>{u.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTeam(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!teamName.trim()}
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      Create Team
                    </button>
                  </div>
                </form>
              )}

              {/* Team Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teams.map(t => {
                  const teamMembers = users.filter(u => (u.teamIds || []).includes(t.id) || (t.memberIds || []).includes(u.id));
                  return (
                    <div 
                      key={t.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: t.color }} 
                            />
                            <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                          </div>
                          {teams.length > 1 && (
                            <button
                              onClick={() => onDeleteTeam(t.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                              title="Delete Team"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {t.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {teamMembers.slice(0, 4).map(m => (
                            <img
                              key={m.id}
                              src={m.avatar}
                              alt={m.name}
                              title={`${m.name} (${m.role})`}
                              className="w-6 h-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                          {teamMembers.length > 4 && (
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center ring-2 ring-white">
                              +{teamMembers.length - 4}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Workspace Members Management Tab */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Workspace Members & Personas
                  </h4>
                  <p className="text-xs text-slate-400">Invite new team members with custom titles and team assignments</p>
                </div>
                {!isAddingMember && (
                  <button
                    onClick={() => setIsAddingMember(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    <UserPlus size={14} />
                    <span>Add Member</span>
                  </button>
                )}
              </div>

              {/* Add Member Inline Form */}
              {isAddingMember && (
                <form 
                  onSubmit={handleAddMemberSubmit}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-in fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Add Workspace Colleague</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingMember(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jordan Miller"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. jordan.miller@company.com"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Custom Role Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Copywriter, Talent Lead, Account Exec"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Marketing, Sales, People Ops, Design"
                        value={memberDepartment}
                        onChange={(e) => setMemberDepartment(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Role Level</label>
                      <select
                        value={memberRoleLevel}
                        onChange={(e) => setMemberRoleLevel(e.target.value as UserRoleLevel)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="admin">Workspace Admin</option>
                        <option value="manager">Team Manager</option>
                        <option value="member">Active Member</option>
                        <option value="guest">Viewer / Guest</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Avatar Image URL</label>
                      <input
                        type="text"
                        value={memberAvatar}
                        onChange={(e) => setMemberAvatar(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Assign to Teams</label>
                    <div className="flex flex-wrap gap-1.5">
                      {teams.map(t => {
                        const isSelected = memberTeamIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleMemberTeamSelection(t.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setIsAddingMember(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!memberName.trim() || !memberEmail.trim()}
                      className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add to Workspace
                    </button>
                  </div>
                </form>
              )}

              {/* Members Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3 pl-4">Member</th>
                      <th className="p-3">Role & Dept</th>
                      <th className="p-3">Assigned Teams</th>
                      <th className="p-3">Permission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map(u => {
                      const userTeams = teams.filter(t => (u.teamIds || []).includes(t.id));
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="flex items-center gap-2.5">
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200" />
                              <div>
                                <span className="font-bold text-slate-900 block">{u.name}</span>
                                <span className="text-[10px] text-slate-400">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{u.role}</span>
                            <span className="text-[10px] text-slate-400">{u.department || 'General'}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {userTeams.length > 0 ? (
                                userTeams.map(ut => (
                                  <span
                                    key={ut.id}
                                    className="px-1.5 py-0.5 rounded text-[9px] font-semibold text-slate-700 bg-slate-100 flex items-center gap-1"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ut.color }} />
                                    <span>{ut.name}</span>
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">No teams</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              u.roleLevel === 'admin' 
                                ? 'bg-amber-100 text-amber-800' 
                                : u.roleLevel === 'manager'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.roleLevel || 'member'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
