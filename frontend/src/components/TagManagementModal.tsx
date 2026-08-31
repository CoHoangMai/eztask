import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  Palette
} from 'lucide-react';
import type { Label } from '../types/kanban';

interface TagManagementModalProps {
  labels: Label[];
  onClose: () => void;
  onCreateLabel: (label: Omit<Label, 'id'>) => void;
  onDeleteLabel: (labelId: string) => void;
}

const COLOR_PRESETS = [
  { name: 'Blue', color: '#2563eb', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' },
  { name: 'Rose / Red', color: '#dc2626', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-300 dark:border-rose-800' },
  { name: 'Purple', color: '#7c3aed', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-800' },
  { name: 'Pink', color: '#db2777', bg: 'bg-pink-100 dark:bg-pink-950/60', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-300 dark:border-pink-800' },
  { name: 'Emerald / Green', color: '#059669', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' },
  { name: 'Amber / Orange', color: '#d97706', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-300 dark:border-amber-800' },
  { name: 'Cyan / Sky', color: '#0284c7', bg: 'bg-sky-100 dark:bg-sky-950/60', text: 'text-sky-800 dark:text-sky-300', border: 'border-sky-300 dark:border-sky-800' },
  { name: 'Slate / Gray', color: '#64748b', bg: 'bg-slate-100 dark:bg-slate-800/80', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' },
];

const CATEGORY_PRESETS = ['Product', 'Marketing', 'Design', 'Sales', 'Operations', 'General'];

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
  labels,
  onClose,
  onCreateLabel,
  onDeleteLabel,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagCategory, setTagCategory] = useState('Product');
  const [selectedColorPreset, setSelectedColorPreset] = useState(COLOR_PRESETS[0]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    onCreateLabel({
      name: tagName.trim(),
      color: selectedColorPreset.color,
      bg: selectedColorPreset.bg,
      text: selectedColorPreset.text,
      border: selectedColorPreset.border,
      category: tagCategory,
    });

    setTagName('');
    setIsCreating(false);
  };

  const filteredLabels = activeCategoryFilter === 'all'
    ? labels
    : labels.filter(l => (l.category || 'General').toLowerCase() === activeCategoryFilter.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div 
        id="tag-management-modal"
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Tag size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Custom Tags & Taxonomy</h3>
              <p className="text-xs text-slate-500">Configure flexible labels for any business domain or project workflow</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({labels.length})
            </button>
            {CATEGORY_PRESETS.map(cat => {
              const count = labels.filter(l => (l.category || 'General').toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    activeCategoryFilter.toLowerCase() === cat.toLowerCase()
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs shrink-0 ml-2"
            >
              <Plus size={14} />
              <span>Create Tag</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Create Tag Inline Form */}
          {isCreating && (
            <form 
              onSubmit={handleCreateSubmit}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">New Custom Tag</span>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Tag Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Objective, Video Script, High Value Lead"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Domain Category</label>
                  <select
                    value={tagCategory}
                    onChange={(e) => setTagCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORY_PRESETS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Color Palette & Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(preset => {
                    const isSelected = selectedColorPreset.color === preset.color;
                    return (
                      <button
                        key={preset.color}
                        type="button"
                        onClick={() => setSelectedColorPreset(preset)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/50' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: preset.color }} />
                        <span className="text-[11px] font-medium text-slate-700">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag Live Preview */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Tag Live Preview:</span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${selectedColorPreset.bg} ${selectedColorPreset.text} ${selectedColorPreset.border}`}>
                  {tagName.trim() || 'Sample Tag Name'}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tagName.trim()}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  Save Tag
                </button>
              </div>
            </form>
          )}

          {/* Tags List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredLabels.map(lbl => (
              <div 
                key={lbl.id}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border shrink-0 ${lbl.bg} ${lbl.text} ${lbl.border || ''}`}>
                    {lbl.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {lbl.category || 'General'}
                  </span>
                </div>

                {labels.length > 1 && (
                  <button
                    onClick={() => onDeleteLabel(lbl.id)}
                    className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Tag"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
