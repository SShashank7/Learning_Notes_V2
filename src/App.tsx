import { useState, useMemo, useCallback, useEffect } from "react";
import { Category, Note, ViewMode, ConfidenceLevel } from "./types";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CategoryView from "./components/CategoryView";
import RevisionMode from "./components/RevisionMode";

import {
  addNoteToDB,
  getNotesFromDB,
  updateNoteInDB,
  deleteNoteFromDB,
  deleteNotesByCategoryId,
} from "./services/noteService";

import {
  addCategoryToDB,
  getCategoriesFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
} from "./services/categoryService";

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // 🔥 Load data
  useEffect(() => {
    const fetchData = async () => {
      const notesData = await getNotesFromDB();
      const categoriesData = await getCategoriesFromDB();

      setNotes(notesData);
      setCategories(categoriesData);
    };

    fetchData();
  }, []);

  // 📊 Note count
  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      counts[n.categoryId] = (counts[n.categoryId] || 0) + 1;
    });
    return counts;
  }, [notes]);

  // 🎯 View change
  const handleViewChange = useCallback(
    (view: ViewMode, categoryId?: string) => {
      setActiveView(view);
      setActiveCategoryId(categoryId || null);
    },
    []
  );

  // 📁 Add Category
  const handleAddCategory = useCallback(
    async (name: string, color: string, icon: string): Promise<void> => {
      const newCat = await addCategoryToDB({
        name,
        color,
        icon,
        createdAt: Date.now(),
      });

      setCategories((prev) => [...prev, newCat]);
    },
    []
  );

  // ✏️ Edit Category
  const handleEditCategory = useCallback(
    async (
      id: string,
      name: string,
      color: string,
      icon: string
    ): Promise<void> => {
      await updateCategoryInDB(id, { name, color, icon });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, name, color, icon } : c
        )
      );
    },
    []
  );

  // 🗑️ DELETE CATEGORY (🔥 CASCADE FIX)
  const handleDeleteCategory = useCallback(
    async (id: string): Promise<void> => {
      // Step 1: delete all notes of this category
      await deleteNotesByCategoryId(id);

      // Step 2: delete category
      await deleteCategoryFromDB(id);

      // Step 3: update UI
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setNotes((prev) => prev.filter((n) => n.categoryId !== id));

      if (activeCategoryId === id) {
        setActiveView("dashboard");
        setActiveCategoryId(null);
      }
    },
    [activeCategoryId]
  );

  // 📝 Add Note
  const handleAddNote = useCallback(
    async (
      title: string,
      content: string,
      categoryId: string
    ): Promise<void> => {
      const newNote = await addNoteToDB({
        title,
        content,
        categoryId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastRevisedAt: null,
        revisionCount: 0,
        confidence: "low",
      });

      setNotes((prev) => [...prev, newNote]);
    },
    []
  );

  // ✏️ Edit Note
  const handleEditNote = useCallback(
    async (
      id: string,
      title: string,
      content: string,
      confidence: ConfidenceLevel
    ): Promise<void> => {
      await updateNoteInDB(id, {
        title,
        content,
        confidence,
        updatedAt: Date.now(),
      });

      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, title, content, confidence, updatedAt: Date.now() }
            : n
        )
      );
    },
    []
  );

  // 🗑️ Delete Note
  const handleDeleteNote = useCallback(
    async (id: string): Promise<void> => {
      await deleteNoteFromDB(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    []
  );

  // 🔁 Revision handlers
  const handleUpdateConfidence = useCallback(
    (id: string, confidence: ConfidenceLevel) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, confidence, updatedAt: Date.now() } : n
        )
      );
    },
    []
  );

  const handleMarkRevised = useCallback((id: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              lastRevisedAt: Date.now(),
              revisionCount: n.revisionCount + 1,
            }
          : n
      )
    );
  }, []);

  // 📌 Active category
  const activeCategory = activeCategoryId
    ? categories.find((c) => c.id === activeCategoryId) || null
    : null;

  const categoryNotes = activeCategoryId
    ? notes.filter((n) => n.categoryId === activeCategoryId)
    : [];

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
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

      <main className="flex-1 flex flex-col">
        {activeView === "dashboard" && (
          <Dashboard
            categories={categories}
            notes={notes}
            onViewChange={handleViewChange}
          />
        )}

        {activeView === "category" && activeCategory && (
          <CategoryView
            category={activeCategory}
            notes={categoryNotes}
            onAddNote={handleAddNote}
            onEditNote={handleEditNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {activeView === "revision" && (
          <RevisionMode
            categories={categories}
            notes={notes}
            onUpdateConfidence={handleUpdateConfidence}
            onMarkRevised={handleMarkRevised}
          />
        )}
      </main>
    </div>
  );
}