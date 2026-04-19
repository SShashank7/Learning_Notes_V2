export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
  lastRevisedAt: number | null;
  revisionCount: number;
  confidence: 'low' | 'medium' | 'high' | 'mastered';
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export type ViewMode = 'dashboard' | 'category' | 'revision';
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'mastered';
