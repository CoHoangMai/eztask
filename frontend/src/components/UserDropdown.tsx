import React, { useState, useRef, useEffect } from 'react';
import { 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Check, 
  Settings,
  Sparkles 
} from 'lucide-react';
import type { Assignee } from '../types/kanban';
import { DEFAULT_USERS } from '../data/initialKanbanData';

interface UserDropdownProps {
  currentUser: Assignee;
  availableUsers?: Assignee[];
  onSelectUser: (user: Assignee) => void;
  onOpenProfileView: () => void;
  onLogout: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  currentUser,
  availableUsers = DEFAULT_USERS,
  onSelectUser,
  onOpenProfileView,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Trigger Button */}
      <button 
        id="user-profile-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Account & Workspace Settings"
        className="flex items-center gap-2.5 pl-2 border-l border-slate-800 hover:bg-slate-800/80 py-1.5 px-2 rounded-xl transition-colors text-left group cursor-pointer"
      >
        <div className="relative">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
        </div>

        <div className="hidden sm:block">
          <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
            <span>{currentUser.name}</span>
            <ChevronDown size={12} className="text-slate-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          id="user-profile-dropdown-panel"
          className="absolute right-0 mt-2 w-72 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header with Active User info */}
          <div className="p-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{currentUser.name}</h4>
                <p className="text-[11px] text-slate-400 truncate">{currentUser.email || 'user@eztask.dev'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/80">
                    <ShieldCheck size={10} />
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Persona / Role Switcher (For Testing & Demo) */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" />
                Team Personas
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Quick switch</span>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {availableUsers.map((usr) => {
                const isActive = usr.id === currentUser.id;
                return (
                  <button
                    key={usr.id}
                    onClick={() => {
                      onSelectUser(usr);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2 rounded-xl text-left transition-colors flex items-center justify-between gap-2 text-xs cursor-pointer ${
                      isActive 
                        ? 'bg-blue-950/70 text-blue-200 font-medium border border-blue-700/80' 
                        : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={usr.avatar} alt={usr.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold truncate leading-tight">{usr.name}</div>
                        <div className="text-[9px] text-slate-400 truncate leading-tight">{usr.role}</div>
                      </div>
                    </div>
                    {isActive && <Check size={13} className="text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1 bg-slate-950">
            <button
              id="user-profile-settings-btn"
              onClick={() => {
                setIsOpen(false);
                onOpenProfileView();
              }}
              className="w-full px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Settings size={14} className="text-slate-400" />
              <span>Account & Profile Settings</span>
            </button>

            <button
              id="user-logout-btn"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
