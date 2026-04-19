import { Category, Note } from '../types';
import {
  BookOpen,
  TrendingUp,
  AlertCircle,
  Trophy,
  Clock,
  BarChart3,
  Zap,
} from 'lucide-react';

interface DashboardProps {
  categories: Category[];
  notes: Note[];
  onViewChange: (view: 'category' | 'revision', categoryId?: string) => void;
}

export default function Dashboard({ categories, notes, onViewChange }: DashboardProps) {
  const totalNotes = notes.length;
  const lowConfidence = notes.filter((n) => n.confidence === 'low').length;
  const medConfidence = notes.filter((n) => n.confidence === 'medium').length;
  const highConfidence = notes.filter((n) => n.confidence === 'high').length;
  const mastered = notes.filter((n) => n.confidence === 'mastered').length;
  const needsRevision = notes.filter(
    (n) => n.confidence === 'low' || n.confidence === 'medium'
  ).length;
  const totalRevisions = notes.reduce((sum, n) => sum + n.revisionCount, 0);
  const recentlyAdded = [...notes].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

  const confidencePercent = totalNotes > 0
    ? Math.round(((highConfidence + mastered) / totalNotes) * 100)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Overview of your notes and revision progress</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <BookOpen size={20} className="text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalNotes}</p>
            <p className="text-sm text-gray-500 mt-1">Total Topics</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-amber-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{needsRevision}</p>
            <p className="text-sm text-gray-500 mt-1">Needs Revision</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{mastered}</p>
            <p className="text-sm text-gray-500 mt-1">Mastered</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{totalRevisions}</p>
            <p className="text-sm text-gray-500 mt-1">Total Revisions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Confidence Distribution */}
          <div className="lg:col-span-1 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={18} className="text-indigo-400" />
              <h2 className="text-white font-semibold">Confidence</h2>
            </div>

            <div className="relative w-32 h-32 mx-auto mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1f2937" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke="url(#gradient)" strokeWidth="3"
                  strokeDasharray={`${confidencePercent} ${100 - confidencePercent}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{confidencePercent}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-400">Low</span>
                </div>
                <span className="text-sm font-semibold text-white">{lowConfidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-sm text-gray-400">Medium</span>
                </div>
                <span className="text-sm font-semibold text-white">{medConfidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-sm text-gray-400">High</span>
                </div>
                <span className="text-sm font-semibold text-white">{highConfidence}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm text-gray-400">Mastered</span>
                </div>
                <span className="text-sm font-semibold text-white">{mastered}</span>
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-white font-semibold">Categories</h2>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No categories yet. Create one from the sidebar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => {
                  const catNotes = notes.filter((n) => n.categoryId === cat.id);
                  const catMastered = catNotes.filter((n) => n.confidence === 'mastered' || n.confidence === 'high').length;
                  const progress = catNotes.length > 0 ? Math.round((catMastered / catNotes.length) * 100) : 0;

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-700/30 cursor-pointer transition-colors group"
                      onClick={() => onViewChange('category', cat.id)}
                    >
                      <span
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ backgroundColor: cat.color + '22' }}
                      >
                        {cat.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">
                            {cat.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {catNotes.length} topic{catNotes.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 w-10 text-right">{progress}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recently Added */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-blue-400" />
            <h2 className="text-white font-semibold">Recently Added</h2>
          </div>

          {recentlyAdded.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No notes yet. Start adding topics!</p>
          ) : (
            <div className="space-y-2">
              {recentlyAdded.map((note) => {
                const cat = categories.find((c) => c.id === note.categoryId);
                return (
                  <div
                    key={note.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => onViewChange('category', note.categoryId)}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                      style={{ backgroundColor: (cat?.color || '#6366f1') + '22' }}
                    >
                      {cat?.icon || '📝'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{note.title}</p>
                      <p className="text-xs text-gray-500 truncate">{note.content}</p>
                    </div>
                    <ConfidenceBadge confidence={note.confidence} />
                    <span className="text-xs text-gray-600 shrink-0">
                      {formatTimeAgo(note.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Action */}
        {needsRevision > 0 && (
          <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-white font-semibold mb-1">
                  🔥 {needsRevision} topic{needsRevision > 1 ? 's' : ''} need{needsRevision === 1 ? 's' : ''} revision
                </h3>
                <p className="text-gray-400 text-sm">
                  Start a revision session to strengthen your understanding
                </p>
              </div>
              <button
                onClick={() => onViewChange('revision')}
                className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
              >
                Start Revision
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const styles: Record<string, string> = {
    low: 'bg-red-500/15 text-red-400',
    medium: 'bg-amber-500/15 text-amber-400',
    high: 'bg-blue-500/15 text-blue-400',
    mastered: 'bg-emerald-500/15 text-emerald-400',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize shrink-0 ${styles[confidence] || ''}`}>
      {confidence}
    </span>
  );
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
