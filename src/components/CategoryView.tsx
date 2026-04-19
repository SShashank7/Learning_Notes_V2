import { useState } from 'react';
import { Category, Note, ConfidenceLevel } from '../types';
import {
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  Search,
  SortAsc,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface CategoryViewProps {
  category: Category;
  notes: Note[];
  onAddNote: (title: string, content: string, categoryId: string) => void;
  onEditNote: (id: string, title: string, content: string, confidence: ConfidenceLevel) => void;
  onDeleteNote: (id: string) => void;
}

type SortKey = 'newest' | 'oldest' | 'alpha' | 'confidence';

export default function CategoryView({
  category,
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}: CategoryViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formConfidence, setFormConfidence] = useState<ConfidenceLevel>('low');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.createdAt - a.createdAt;
        case 'oldest': return a.createdAt - b.createdAt;
        case 'alpha': return a.title.localeCompare(b.title);
        case 'confidence': {
          const order = { low: 0, medium: 1, high: 2, mastered: 3 };
          return order[a.confidence] - order[b.confidence];
        }
        default: return 0;
      }
    });

  const handleAdd = () => {
    if (formTitle.trim()) {
      onAddNote(formTitle.trim(), formContent.trim(), category.id);
      setFormTitle('');
      setFormContent('');
      setShowAddForm(false);
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingId(note.id);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormConfidence(note.confidence);
  };

  const handleSaveEdit = () => {
    if (editingId && formTitle.trim()) {
      onEditNote(editingId, formTitle.trim(), formContent.trim(), formConfidence);
      setEditingId(null);
      setFormTitle('');
      setFormContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormTitle('');
    setFormContent('');
  };

  const confidenceConfig: Record<ConfidenceLevel, { color: string; bg: string; border: string; label: string }> = {
    low: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: '🔴 Low' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '🟡 Medium' },
    high: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: '🔵 High' },
    mastered: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: '🟢 Mastered' },
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: category.color + '22', boxShadow: `0 8px 24px ${category.color}15` }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{category.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                {notes.length} topic{notes.length !== 1 ? 's' : ''} •{' '}
                {notes.filter((n) => n.confidence === 'mastered').length} mastered
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setFormTitle('');
              setFormContent('');
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} />
            Add Topic
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics..."
              className="w-full bg-gray-800/50 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-gray-700/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-800/50 rounded-xl border border-gray-700/50 p-1">
            {([
              { key: 'newest', icon: Clock, label: 'Newest' },
              { key: 'oldest', icon: Clock, label: 'Oldest' },
              { key: 'alpha', icon: SortAsc, label: 'A-Z' },
              { key: 'confidence', icon: Sparkles, label: 'Confidence' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === key
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 bg-gray-800/60 rounded-2xl p-5 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              New Topic
            </h3>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Topic title..."
              className="w-full bg-gray-700/50 text-white text-sm rounded-xl px-4 py-3 mb-3 outline-none border border-gray-600/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-500"
              autoFocus
            />
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Notes, key points, explanations..."
              rows={4}
              className="w-full bg-gray-700/50 text-white text-sm rounded-xl px-4 py-3 mb-4 outline-none border border-gray-600/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 placeholder-gray-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!formTitle.trim()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
              >
                <Check size={16} /> Add Topic
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-gray-600" />
            </div>
            <h3 className="text-gray-400 font-medium mb-1">
              {searchQuery ? 'No matching topics' : 'No topics yet'}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchQuery
                ? 'Try a different search term'
                : 'Click "Add Topic" to create your first note in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => {
              const conf = confidenceConfig[note.confidence];
              const isExpanded = expandedId === note.id;
              const isEditing = editingId === note.id;

              if (isEditing) {
                return (
                  <div
                    key={note.id}
                    className="bg-gray-800/60 rounded-2xl p-5 border border-indigo-500/20"
                  >
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Edit3 size={16} className="text-indigo-400" />
                      Edit Topic
                    </h3>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-gray-700/50 text-white text-sm rounded-xl px-4 py-3 mb-3 outline-none border border-gray-600/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                      autoFocus
                    />
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      rows={4}
                      className="w-full bg-gray-700/50 text-white text-sm rounded-xl px-4 py-3 mb-3 outline-none border border-gray-600/50 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    />
                    {/* Confidence selector */}
                    <div className="mb-4">
                      <label className="text-xs text-gray-400 font-medium mb-2 block">Confidence Level</label>
                      <div className="flex gap-2 flex-wrap">
                        {(Object.keys(confidenceConfig) as ConfidenceLevel[]).map((level) => {
                          const c = confidenceConfig[level];
                          return (
                            <button
                              key={level}
                              onClick={() => setFormConfidence(level)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                formConfidence === level
                                  ? `${c.bg} ${c.color} ${c.border} ring-1 ring-current`
                                  : 'border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-600'
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                      >
                        <X size={16} /> Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
                      >
                        <Check size={16} /> Save
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={note.id}
                  className={`bg-gray-800/40 rounded-2xl border transition-all hover:bg-gray-800/60 ${conf.border}`}
                >
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : note.id)}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${conf.bg}`}
                    >
                      <span className="text-sm">
                        {note.confidence === 'mastered' ? '⭐' : note.confidence === 'high' ? '🔷' : note.confidence === 'medium' ? '🔶' : '🔸'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium text-sm">{note.title}</h3>
                      {!isExpanded && (
                        <p className="text-gray-500 text-xs truncate mt-0.5">{note.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${conf.bg} ${conf.color}`}>
                        {note.confidence}
                      </span>
                      {note.revisionCount > 0 && (
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <BookOpen size={12} /> {note.revisionCount}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-500" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700/30 pt-3">
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                        {note.content || <span className="text-gray-600 italic">No notes added yet</span>}
                      </p>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>Created {formatDate(note.createdAt)}</span>
                          {note.lastRevisedAt && (
                            <span>Last revised {formatDate(note.lastRevisedAt)}</span>
                          )}
                          {note.revisionCount > 0 && (
                            <span>{note.revisionCount} revision{note.revisionCount > 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(note);
                            }}
                            className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          {deleteConfirmId === note.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNote(note.id);
                                  setDeleteConfirmId(null);
                                  setExpandedId(null);
                                }}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Check size={13} /> Confirm
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(note.id);
                              }}
                              className="flex items-center gap-1.5 bg-gray-700 hover:bg-red-600/20 text-gray-400 hover:text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
