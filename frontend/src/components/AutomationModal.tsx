import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  ArrowRight
} from 'lucide-react';
import type { AutomationRule } from '../types/kanban';

interface AutomationModalProps {
  automations: AutomationRule[];
  onClose: () => void;
  onToggleAutomation: (id: string) => void;
  onAddAutomation: (rule: Omit<AutomationRule, 'id'>) => void;
  onDeleteAutomation: (id: string) => void;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({
  automations,
  onClose,
  onToggleAutomation,
  onAddAutomation,
  onDeleteAutomation
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<AutomationRule['triggerEvent']>('checklist_completed');
  const [actionSummary, setActionSummary] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddAutomation({
      title: title.trim(),
      description: description.trim() || 'Custom workflow rule',
      triggerEvent,
      actionSummary: actionSummary.trim() || 'Execute automated action',
      enabled: true
    });
    setTitle('');
    setDescription('');
    setActionSummary('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        id="automation-modal-box"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">EzTask Automations</h3>
              <p className="text-xs text-slate-500">Configure automated rules and triggers</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {!isCreating ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Workflows</span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  <Plus size={14} />
                  <span>Create Automation</span>
                </button>
              </div>

              <div className="space-y-3">
                {automations.map(rule => (
                  <div 
                    key={rule.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-start justify-between gap-4 shadow-xs"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">{rule.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {rule.triggerEvent.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                      
                      <div className="flex items-center gap-2 mt-3 text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <ArrowRight size={14} className="text-blue-600" />
                        <span>Action: {rule.actionSummary}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleAutomation(rule.id)}
                        className={`transition-colors ${rule.enabled ? 'text-emerald-600' : 'text-slate-400'}`}
                        title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                      >
                        {rule.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                      <button
                        onClick={() => onDeleteAutomation(rule.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Auto-archive completed QA tasks"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  When this trigger occurs:
                </label>
                <select
                  value={triggerEvent}
                  onChange={e => setTriggerEvent(e.target.value as AutomationRule['triggerEvent'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="checklist_completed">When all checklist items are completed</option>
                  <option value="card_moved">When a card is moved to another list</option>
                  <option value="card_created">When a card with Urgent priority is created</option>
                  <option value="due_date_reached">When task due date is reached</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Perform this action:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Move task to Done & notify assignees"
                  value={actionSummary}
                  onChange={e => setActionSummary(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Description / Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly explain what this rule accomplishes..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
                >
                  Save Automation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
