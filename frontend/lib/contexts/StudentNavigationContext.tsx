'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Session {
  id: string;
  type: string;
  year: number;
  chapterId: string;
  imageUrl?: string | null;
}

interface StudentNavigationContextType {
  selectedChapterId: string | null;
  sessions: Session[];
  setSelectedChapterId: (chapterId: string | null) => void;
  setSessions: (sessions: Session[]) => void;
}

const StudentNavigationContext = createContext<StudentNavigationContextType | undefined>(undefined);

export function StudentNavigationProvider({ children }: { children: ReactNode }) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  return (
    <StudentNavigationContext.Provider
      value={{
        selectedChapterId,
        sessions,
        setSelectedChapterId,
        setSessions,
      }}
    >
      {children}
    </StudentNavigationContext.Provider>
  );
}

export function useStudentNavigation() {
  const context = useContext(StudentNavigationContext);
  if (context === undefined) {
    throw new Error('useStudentNavigation must be used within a StudentNavigationProvider');
  }
  return context;
}

