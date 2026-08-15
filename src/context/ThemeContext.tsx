import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

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
      createTheme({
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
              paper: {
                backgroundColor: mode === 'dark' ? '#18181f' : '#ffffff',
                color: mode === 'dark' ? '#ffffff' : 'inherit',
              },
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
      }),
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
