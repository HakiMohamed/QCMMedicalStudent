'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

interface LoadingContextType {
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

let loadingSetter: ((loading: boolean) => void) | null = null;

export const setGlobalLoading = (loading: boolean) => {
  if (loadingSetter) {
    loadingSetter(loading);
  }
};

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadingSetter = setLoading;
    return () => {
      loadingSetter = null;
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
      {mounted && (
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          open={loading}
        >
          <CircularProgress color="primary" size={60} />
        </Backdrop>
      )}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

