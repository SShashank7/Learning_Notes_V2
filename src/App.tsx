import { useState, useMemo, useCallback, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { Category, Note, ViewMode, ConfidenceLevel } from './types';
import { defaultCategories } from './data/defaults';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CategoryView from './components/CategoryView';
import RevisionMode from './components/RevisionMode';

// 🔥 Firebase services
import { addNoteToDB, getNotesFromDB } from './services/noteService';

export default function App() {
  // ❌ Removed localStorage
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [notes, setNotes] = useState<Note[]>([]);

  const [activeView, setActiveView] = useState<ViewMode>('dashboard');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 🔥 Load notes from Firebase on app start
  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotesFromDB();
      setNotes(data as Note[]);
    };
    fetchNotes();
  }, []);

  // Note counts per category
  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      counts[n.categoryId] = (counts[n.categoryId] || 0) + 1;
    });
    return counts;
  }, [notes]);

  // View change handler
  const handleViewChange = useCallback((view: ViewMode, categoryId?: string) => {
    setActiveView(view);
    setActiveCategoryId(categoryId || null);
  }, []);

  // Category CRUD (still local for now)
  const handleAddCategory = useCallback((name: string, color: string, icon: string) => {
    const newCat: Category = {
      id: uuid(),
      name,
      color,
      icon,
      createdAt: Date.now(),
    };
    setCategories((prev) => [...prev, newCat]);
  }, []);

  const handleEditCategory = useCallback((id: string, name: string, color: string, icon: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, color, icon } : c))
    );
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setNotes((prev) => prev.filter((n) => n.categoryId !== id));
    if (activeCategoryId === id) {
      setActiveView('dashboard');
      setActiveCategoryId(null);
    }
  }, [activeCategoryId]);

  // 🔥 Add Note → Firebase
  const handleAddNote = useCallback(async (title: string, content: string, categoryId: string) => {
    const newNote: Note = {
      id: uuid(),
      title,
      content,
      categoryId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastRevisedAt: null,
      revisionCount: 0,
      confidence: 'low',
    };

    await addNoteToDB(newNote);

    // update UI instantly
    setNotes((prev) => [...prev, newNote]);
  }, []);

  // 🔥 Edit Note (UI only for now)
  const handleEditNote = useCallback((id: string, title: string, content: string, confidence: ConfidenceLevel) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, title, content, confidence, updatedAt: Date.now() }
          : n
      )
    );
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Revision handlers
  const handleUpdateConfidence = useCallback((id: string, confidence: ConfidenceLevel) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, confidence, updatedAt: Date.now() } : n
      )
    );
  }, []);

  const handleMarkRevised = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, lastRevisedAt: Date.now(), revisionCount: n.revisionCount + 1 }
          : n
      )
    );
  }, []);

  // Active category data
  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId) || null
    : null;

  const categoryNotes = activeCategoryId
    ? notes.filter((n) => n.categoryId === activeCategoryId)
    : [];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        activeView={activeView}
        activeCategoryId={activeCategoryId}
        onViewChange={handleViewChange}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        noteCounts={noteCounts}
        totalNotes={notes.length}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'dashboard' && (
          <Dashboard
            categories={categories}
            notes={notes}
            onViewChange={handleViewChange}
          />
        )}

        {activeView === 'category' && activeCategory && (
          <CategoryView
            category={activeCategory}
            notes={categoryNotes}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeView === 'revision' && (
          <RevisionMode
            categories={categories}
            notes={notes}
            onUpdateConfidence={handleUpdateConfidence}
            onMarkRevised={handleMarkRevised}
          />
        )}

        {activeView === 'category' && !activeCategory && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Category not found</p>
              <button
                onClick={() => handleViewChange('dashboard')}
                className="mt-3 text-indigo-400 hover:underline text-sm"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}