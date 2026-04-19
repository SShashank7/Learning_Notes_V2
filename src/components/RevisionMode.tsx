import { useState, useMemo } from 'react';
import { Category, Note, ConfidenceLevel } from '../types';
import {
  BookOpen,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
  Shuffle,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface RevisionModeProps {
  categories: Category[];
  notes: Note[];
  onUpdateConfidence: (id: string, confidence: ConfidenceLevel) => void;
  onMarkRevised: (id: string) => void;
}

type FilterType = 'all' | 'low' | 'medium' | 'high' | 'unrevised';

export default function RevisionMode({
  categories,
  notes,
  onUpdateConfidence,
  onMarkRevised,
}: RevisionModeProps) {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, improved: 0 });

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (filterCategory !== 'all') {
      result = result.filter((n) => n.categoryId === filterCategory);
    }

    switch (filterType) {
      case 'low':
        result = result.filter((n) => n.confidence === 'low');
        break;
      case 'medium':
        result = result.filter((n) => n.confidence === 'medium');
        break;
      case 'high':
        result = result.filter((n) => n.confidence === 'high');
        break;
      case 'unrevised':
        result = result.filter((n) => n.revisionCount === 0);
        break;
    }

    if (isShuffled) {
      result.sort(() => Math.random() - 0.5);
    } else {
      // Prioritize low confidence first
      const order: Record<string, number> = { low: 0, medium: 1, high: 2, mastered: 3 };
      result.sort((a, b) => order[a.confidence] - order[b.confidence]);
    }

    return result;
  }, [notes, filterCategory, filterType, isShuffled]);

  const currentNote = filteredNotes[currentIndex];
  const currentCategory = currentNote ? categories.find((c) => c.id === currentNote.categoryId) : null;

  const handleNext = () => {
    if (currentIndex < filteredNotes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleConfidenceUpdate = (confidence: ConfidenceLevel) => {
    if (currentNote) {
      const wasImproved =
        (confidence === 'high' || confidence === 'mastered') &&
        (currentNote.confidence === 'low' || currentNote.confidence === 'medium');
      
      onUpdateConfidence(currentNote.id, confidence);
      onMarkRevised(currentNote.id);
      setSessionStats((prev) => ({
        reviewed: prev.reviewed + 1,
        improved: prev.improved + (wasImproved ? 1 : 0),
      }));
      handleNext();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionCompleted(false);
    setSessionStats({ reviewed: 0, improved: 0 });
  };

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800/50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={40} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Notes to Revise</h2>
          <p className="text-gray-500">Add some topics first, then come back for revision!</p>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Trophy size={40} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Complete! 🎉</h2>
          <p className="text-gray-400 mb-6">Great job on your revision session</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <p className="text-3xl font-bold text-indigo-400">{sessionStats.reviewed}</p>
              <p className="text-xs text-gray-500 mt-1">Topics Reviewed</p>
            </div>
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <p className="text-3xl font-bold text-emerald-400">{sessionStats.improved}</p>
              <p className="text-xs text-gray-500 mt-1">Improved</p>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 mx-auto"
          >
            <RotateCcw size={18} /> Start Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
              <Flame size={22} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Revision Mode</h1>
              <p className="text-gray-400 text-sm">Test your knowledge and track confidence</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Filter size={14} />
            <span className="text-xs font-medium">Filter:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentIndex(0);
              setShowAnswer(false);
            }}
            className="bg-gray-800/50 text-white text-xs rounded-lg px-3 py-2 border border-gray-700/50 outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          <div className="flex gap-1 bg-gray-800/50 rounded-lg border border-gray-700/50 p-0.5">
            {([
              { key: 'all', label: 'All' },
              { key: 'low', label: '🔴 Low' },
              { key: 'medium', label: '🟡 Med' },
              { key: 'high', label: '🔵 High' },
              { key: 'unrevised', label: '✨ New' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setFilterType(key);
                  setCurrentIndex(0);
                  setShowAnswer(false);
                }}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  filterType === key
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleShuffle}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              isShuffled
                ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                : 'bg-gray-800/50 text-gray-500 border-gray-700/50 hover:text-gray-300'
            }`}
          >
            <Shuffle size={13} /> Shuffle
          </button>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-gray-600" />
            </div>
            <h3 className="text-gray-400 font-medium mb-1">No topics match this filter</h3>
            <p className="text-gray-600 text-sm">Try changing the filter or category</p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  Topic {currentIndex + 1} of {filteredNotes.length}
                </span>
                <span className="text-xs text-gray-500">
                  {sessionStats.reviewed} reviewed this session
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / filteredNotes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            {currentNote && (
              <div className="mb-6">
                {/* Category Badge */}
                {currentCategory && (
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                      style={{ backgroundColor: currentCategory.color + '22' }}
                    >
                      {currentCategory.icon}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{currentCategory.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ml-auto ${
                      currentNote.confidence === 'low' ? 'bg-red-500/15 text-red-400' :
                      currentNote.confidence === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                      currentNote.confidence === 'high' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-emerald-500/15 text-emerald-400'
                    }`}>
                      {currentNote.confidence}
                    </span>
                  </div>
                )}

                {/* Card */}
                <div className="bg-gradient-to-br from-gray-800/80 to-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-xl">
                  {/* Question Side */}
                  <div className="p-8 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Topic</p>
                    <h2 className="text-2xl font-bold text-white mb-2">{currentNote.title}</h2>
                    {currentNote.revisionCount > 0 && (
                      <p className="text-xs text-gray-600">
                        Revised {currentNote.revisionCount} time{currentNote.revisionCount > 1 ? 's' : ''}
                        {currentNote.lastRevisedAt && ` • Last: ${formatDate(currentNote.lastRevisedAt)}`}
                      </p>
                    )}
                  </div>

                  {/* Reveal Button */}
                  {!showAnswer ? (
                    <div className="border-t border-gray-700/30 p-6 text-center">
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mx-auto hover:scale-105"
                      >
                        <Eye size={18} /> Reveal Notes
                      </button>
                      <p className="text-xs text-gray-600 mt-3">Try to recall what you know before revealing</p>
                    </div>
                  ) : (
                    <>
                      {/* Answer Side */}
                      <div className="border-t border-gray-700/30 p-6 bg-gray-900/30">
                        <div className="flex items-center gap-2 mb-3">
                          <EyeOff size={14} className="text-indigo-400" />
                          <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Your Notes</p>
                        </div>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentNote.content || <span className="text-gray-600 italic">No detailed notes were added for this topic.</span>}
                        </p>
                      </div>

                      {/* Confidence Rating */}
                      <div className="border-t border-gray-700/30 p-6">
                        <p className="text-xs text-gray-500 text-center mb-4 font-medium">How well did you know this?</p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => handleConfidenceUpdate('low')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all group"
                          >
                            <XCircle size={22} className="text-red-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-red-400">Didn't Know</span>
                          </button>
                          <button
                            onClick={() => handleConfidenceUpdate('medium')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
                          >
                            <ArrowRight size={22} className="text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-amber-400">Partially</span>
                          </button>
                          <button
                            onClick={() => handleConfidenceUpdate('high')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all group"
                          >
                            <CheckCircle2 size={22} className="text-blue-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-blue-400">Knew It</span>
                          </button>
                          <button
                            onClick={() => handleConfidenceUpdate('mastered')}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
                          >
                            <Trophy size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium text-emerald-400">Mastered</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>

                  <div className="flex items-center gap-1.5">
                    {filteredNotes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentIndex(i);
                          setShowAnswer(false);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentIndex
                            ? 'bg-indigo-500 w-6'
                            : i < currentIndex
                            ? 'bg-gray-600'
                            : 'bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentIndex === filteredNotes.length - 1}
                    className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Skip <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
