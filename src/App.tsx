import { useState, useMemo, useCallback, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { Category, Note, ViewMode, ConfidenceLevel } from "./types";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import CategoryView from "./components/CategoryView";
import RevisionMode from "./components/RevisionMode";

// 🔥 Firebase services
import {
  addNoteToDB,
  getNotesFromDB,
  updateNoteInDB,
  deleteNoteFromDB,
} from "./services/noteService";

import {
  addCategoryToDB,
  getCategoriesFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
} from "./services/categoryService";

export default function App() {
  // 🔥 State
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [activeView, setActiveView] = useState<ViewMode>("dashboard");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    null
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 🔥 Load from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const notesData = await getNotesFromDB();
      const categoriesData = await getCategoriesFromDB();

      setNotes(notesData as Note[]);
      setCategories(categoriesData as Category[]);
    };

    fetchData();
  }, []);

  // 📊 Note counts
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
    async (name: string, color: string, icon: string) => {
      const newCat: Category = {
        id: uuid(),
        name,
        color,
        icon,
        createdAt: Date.now(),
      };

      await addCategoryToDB(newCat);
      setCategories((prev) => [...prev, newCat]);
    },
    []
  );

  // ✏️ Edit Category
  const handleEditCategory = useCallback(
    async (id: string, name: string, color: string, icon: string) => {
      await updateCategoryInDB(id, { name, color, icon });

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, name, color, icon } : c
        )
      );
    },
    []
  );

  // 🗑️ Delete Category
  const handleDeleteCategory = useCallback(
    async (id: string) => {
      await deleteCategoryFromDB(id);

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
    async (title: string, content: string, categoryId: string) => {
      const newNote: Note = {
        id: uuid(),
        title,
        content,
        categoryId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastRevisedAt: null,
        revisionCount: 0,
        confidence: "low",
      };

      await addNoteToDB(newNote);
      setNotes((prev) => [...prev, newNote]);
    },
    []
  );

  // ✏️ Edit Note (🔥 FIXED - DB + UI sync)
  const handleEditNote = useCallback(
    async (
      id: string,
      title: string,
      content: string,
      confidence: ConfidenceLevel
    ) => {
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

  // 🗑️ Delete Note (🔥 FIXED - DB + UI sync)
  const handleDeleteNote = useCallback(async (id: string) => {
    await deleteNoteFromDB(id);

    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

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

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
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

        {activeView === "category" && !activeCategory && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">Category not found</p>
              <button
                onClick={() => handleViewChange("dashboard")}
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