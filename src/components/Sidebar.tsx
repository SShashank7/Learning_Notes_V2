import { useState } from 'react';
import { Category, ViewMode } from '../types';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  activeView: ViewMode;
  activeCategoryId: string | null;
  onViewChange: (view: ViewMode, categoryId?: string) => void;
  onAddCategory: (name: string, color: string, icon: string) => void;
  onEditCategory: (id: string, name: string, color: string, icon: string) => void;
  onDeleteCategory: (id: string) => void;
  noteCounts: Record<string, number>;
  totalNotes: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const CATEGORY_COLORS = [
  '#F7DF1E', '#61DAFB', '#3776AB', '#E44D26', '#8B5CF6',
  '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#6366F1',
  '#14B8A6', '#F97316', '#84CC16', '#06B6D4', '#A855F7',
];

const CATEGORY_ICONS = ['📚', '⚡', '⚛️', '🐍', '🏗️', '🧮', '🎨', '🔧', '💡', '🎯', '🚀', '📝', '🔬', '🌐', '💻'];

export default function Sidebar({
  categories,
  activeView,
  activeCategoryId,
  onViewChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  noteCounts,
  totalNotes,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(CATEGORY_COLORS[0]);
  const [formIcon, setFormIcon] = useState(CATEGORY_ICONS[0]);

  const handleAdd = () => {
    if (formName.trim()) {
      onAddCategory(formName.trim(), formColor, formIcon);
      setFormName('');
      setFormColor(CATEGORY_COLORS[0]);
      setFormIcon(CATEGORY_ICONS[0]);
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormColor(cat.color);
    setFormIcon(cat.icon);
  };

  const handleSaveEdit = () => {
    if (editingId && formName.trim()) {
      onEditCategory(editingId, formName.trim(), formColor, formIcon);
      setEditingId(null);
      setFormName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormName('');
  };

  if (collapsed) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 gap-3 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors mb-2"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`p-2.5 rounded-xl transition-all ${
            activeView === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="Dashboard"
        >
          <LayoutDashboard size={20} />
        </button>
        <button
          onClick={() => onViewChange('revision')}
          className={`p-2.5 rounded-xl transition-all ${
            activeView === 'revision'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
          title="Revision Mode"
        >
          <BookOpen size={20} />
        </button>
        <div className="w-8 border-t border-gray-700 my-1" />
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onViewChange('category', cat.id)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
              activeCategoryId === cat.id
                ? 'ring-2 ring-white/30 scale-110'
                : 'hover:scale-110 opacity-70 hover:opacity-100'
            }`}
            style={{ backgroundColor: cat.color + '22' }}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="text-lg">📓</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Notes Tracker</h1>
            <p className="text-gray-500 text-xs">{totalNotes} topics</p>
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation */}
      <div className="p-3">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeView === 'dashboard'
              ? 'bg-indigo-600/20 text-indigo-400 shadow-sm'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button
          onClick={() => onViewChange('revision')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 ${
            activeView === 'revision'
              ? 'bg-amber-600/20 text-amber-400 shadow-sm'
              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
          }`}
        >
          <BookOpen size={18} />
          Revision Mode
          <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-semibold">
            New
          </span>
        </button>
      </div>

      <div className="mx-3 border-t border-gray-800" />

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
          <button
            onClick={() => {
              setShowAddForm(true);
              setFormName('');
              setFormColor(CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]);
              setFormIcon(CATEGORY_ICONS[Math.floor(Math.random() * CATEGORY_ICONS.length)]);
            }}
            className="p-1 rounded-md hover:bg-gray-800 text-gray-500 hover:text-indigo-400 transition-colors"
            title="Add Category"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Add Category Form */}
        {showAddForm && (
          <div className="mb-3 bg-gray-800/60 rounded-xl p-3 border border-gray-700/50">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Category name..."
              className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder-gray-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <div className="flex flex-wrap gap-1.5 mb-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormColor(c)}
                  className={`w-5 h-5 rounded-full transition-all ${formColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800 scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {CATEGORY_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setFormIcon(ic)}
                  className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all ${formIcon === ic ? 'bg-gray-600 ring-1 ring-white/30' : 'hover:bg-gray-700'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
              >
                <Check size={14} /> Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium py-1.5 rounded-lg transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-1">
          {categories.map((cat) => (
            <div key={cat.id}>
              {editingId === cat.id ? (
                <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 mb-1">
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-gray-700/50 text-white text-sm rounded-lg px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {CATEGORY_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setFormColor(c)}
                        className={`w-5 h-5 rounded-full transition-all ${formColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800 scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {CATEGORY_ICONS.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => setFormIcon(ic)}
                        className={`w-7 h-7 rounded-md text-sm flex items-center justify-center transition-all ${formIcon === ic ? 'bg-gray-600 ring-1 ring-white/30' : 'hover:bg-gray-700'}`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      <Check size={14} /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium py-1.5 rounded-lg transition-colors"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    activeCategoryId === cat.id
                      ? 'bg-gray-800 text-white shadow-sm'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                  onClick={() => onViewChange('category', cat.id)}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: cat.color + '22' }}
                  >
                    {cat.icon}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                  <span className="text-xs text-gray-600 font-medium">{noteCounts[cat.id] || 0}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(cat);
                      }}
                      className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(cat.id);
                      }}
                      className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <FolderOpen size={32} className="mx-auto text-gray-700 mb-2" />
            <p className="text-gray-600 text-sm">No categories yet</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-indigo-400 text-sm hover:underline"
            >
              Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
