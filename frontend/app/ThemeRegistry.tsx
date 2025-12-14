'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ReactNode, useMemo } from 'react';
import { LoadingProvider } from '@/lib/contexts/LoadingContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff6b35',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1f2937',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  const cache = useMemo(
    () =>
      createCache({
        key: 'css',
        prepend: true,
      }),
    []
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

