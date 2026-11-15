import { alpha } from '@mui/material';
import type { Theme } from '@mui/material';

/** DataGrid styling matching CustomDataTable, for server-paginated grids. */
export const dataGridSx = (theme: Theme) => {
  const isDark = theme.palette.mode === 'dark';
  const line = isDark ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06);
  return {
    border: 'none',
    fontFamily: 'inherit',
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${line}`,
      fontSize: '0.875rem',
      '&:focus, &:focus-within': { outline: 'none' },
    },
    '& .MuiDataGrid-columnHeaders': {
      backgroundColor: isDark ? alpha('#ffffff', 0.02) : alpha('#000000', 0.02),
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      fontWeight: 700,
      fontSize: '0.75rem',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
    '& .MuiDataGrid-row': {
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.03),
      },
    },
    '& .MuiDataGrid-footerContainer': { borderTop: `1px solid ${line}` },
    '& .MuiDataGrid-overlayWrapper': { minHeight: 280 },
  } as const;
};
