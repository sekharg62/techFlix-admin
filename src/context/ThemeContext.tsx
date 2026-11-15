import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes, CssBaseline } from '@mui/material';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');

  // Load from local storage
  useEffect(() => {
    const savedMode = localStorage.getItem('adminTheme') as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('adminTheme', newMode);
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      // responsiveFontSizes: h1–h6 shrink automatically on phones
      responsiveFontSizes(createTheme({
        palette: {
          mode,
          primary: {
            main: '#e50914', // Red accent
          },
          background: {
            default: mode === 'dark' ? '#000000' : '#f5f5f5', // Black background in dark mode
            paper: mode === 'dark' ? '#141414' : '#ffffff', // Slightly lighter black for cards
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: 15,
          body1: { fontSize: '1rem' },
          body2: { fontSize: '0.92rem', lineHeight: 1.5 },
          caption: { fontSize: '0.8rem' },
          subtitle2: { fontSize: '0.92rem' },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                borderRadius: '8px',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: '12px',
                backgroundImage: 'none',
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              // Phones: dialogs use almost the full screen instead of a cramped centred box
              paper: ({ theme: t }) => ({
                backgroundColor: mode === 'dark' ? '#18181f' : '#ffffff',
                color: mode === 'dark' ? '#ffffff' : 'inherit',
                [t.breakpoints.down('sm')]: {
                  margin: 8,
                  width: 'calc(100% - 16px)',
                  maxWidth: 'calc(100% - 16px) !important',
                  maxHeight: 'calc(100% - 16px)',
                },
              }),
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: ({ theme: t }) => ({ [t.breakpoints.down('sm')]: { padding: '12px 14px' } }),
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: ({ theme: t }) => ({ [t.breakpoints.down('sm')]: { padding: '10px 14px', flexWrap: 'wrap', gap: 8 } }),
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                color: mode === 'dark' ? '#ffffff' : 'inherit',
                fontWeight: 700,
              },
            },
          },
        },
      })),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
