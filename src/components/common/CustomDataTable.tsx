import React, { useState } from 'react';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp, GridFilterModel } from '@mui/x-data-grid';
import {
  Box,
  Paper,
  InputBase,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  SearchOff as SearchOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface CustomDataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  height?: number | string;
  onRefresh?: () => void;
  checkboxSelection?: boolean;
  pageSize?: number;
}

const CustomNoRowsOverlay = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: 1.5,
      color: 'text.secondary',
      py: 8,
    }}
  >
    <SearchOffIcon sx={{ fontSize: 52, opacity: 0.35, color: 'primary.main' }} />
    <Typography variant="h6" fontWeight={600} color="text.primary">
      No matching records found
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, textAlign: 'center' }}>
      We couldn't find any results matching your search criteria. Try using different keywords.
    </Typography>
  </Box>
);

const CustomGridToolbar = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <GridToolbarContainer
      sx={{
        p: 1.5,
        px: 2.5,
        gap: 1,
        borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.04) : alpha('#000000', 0.04)}`,
        '& .MuiButton-root': {
          color: 'text.secondary',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: '4px',
          padding: '4px 10px',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: isDarkMode ? alpha('#ffffff', 0.06) : alpha('#000000', 0.05),
            color: 'text.primary',
          },
        },
      }}
    >
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport slotProps={{ button: { variant: 'text' } }} />
    </GridToolbarContainer>
  );
};

export const CustomDataTable: React.FC<CustomDataTableProps> = ({
  rows,
  columns,
  loading = false,
  title,
  subtitle,
  searchPlaceholder = 'Search across all columns...',
  height = 620,
  onRefresh,
  checkboxSelection = true,
  pageSize = 10,
}) => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState('');
  const [filterModel, setFilterModel] = useState<GridFilterModel>({
    items: [],
    quickFilterValues: [],
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    setFilterModel((prev) => ({
      ...prev,
      quickFilterValues: value.trim() ? value.trim().split(/\s+/) : [],
    }));
  };

  const handleClearSearch = () => {
    setSearchText('');
    setFilterModel((prev) => ({
      ...prev,
      quickFilterValues: [],
    }));
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        backgroundColor: isDarkMode ? '#121216' : '#ffffff',
        border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
        boxShadow: isDarkMode
          ? '0 12px 32px -8px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)'
          : '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Top Header & Search Toolbar */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06)}`,
          background: isDarkMode
            ? 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)'
            : 'linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0) 100%)',
        }}
      >
        {/* Title & Count Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {title && (
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          <Chip
            label={`${rows.length} ${rows.length === 1 ? 'item' : 'items'}`}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              backgroundColor: isDarkMode ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              borderRadius: '20px',
            }}
          />
        </Box>

        {/* Search Bar & Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {/* Custom Search Input */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flexGrow: 1,
              minWidth: { xs: '100%', sm: 280, md: 340 },
              height: 42,
              backgroundColor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#000000', 0.03),
              border: `1px solid ${searchText
                  ? theme.palette.primary.main
                  : isDarkMode
                    ? alpha('#ffffff', 0.12)
                    : alpha('#000000', 0.12)
                }`,
              borderRadius: '12px',
              px: 1.5,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: searchText
                  ? theme.palette.primary.main
                  : isDarkMode
                    ? alpha('#ffffff', 0.25)
                    : alpha('#000000', 0.25),
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.07) : alpha('#000000', 0.04),
              },
              '&:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.08) : '#ffffff',
              },
            }}
          >
            <SearchIcon
              sx={{
                fontSize: 20,
                mr: 1,
                color: searchText ? theme.palette.primary.main : 'text.secondary',
                transition: 'color 0.2s ease',
              }}
            />
            <InputBase
              placeholder={searchPlaceholder}
              value={searchText}
              onChange={handleSearchChange}
              fullWidth
              sx={{
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'text.primary',
                '& input::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.7,
                },
              }}
            />
            {searchText && (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                sx={{
                  p: 0.5,
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08),
                  },
                }}
              >
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>

          {/* Optional Refresh button */}
          {onRefresh && (
            <Tooltip title="Refresh data">
              <IconButton
                onClick={onRefresh}
                sx={{
                  height: 42,
                  width: 42,
                  borderRadius: '6px',
                  border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                  backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                  '&:hover': {
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.05),
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main DataGrid */}
      <Box sx={{ height, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          filterModel={filterModel}
          onFilterModelChange={(newModel) => setFilterModel(newModel)}
          slots={{
            toolbar: CustomGridToolbar,
            noRowsOverlay: CustomNoRowsOverlay,
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            fontFamily: 'inherit',
            '& .MuiDataGrid-cell': {
              display: 'flex !important',
              alignItems: 'center !important',
              borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
              fontSize: '0.95rem',
              color: 'text.primary',
              '&:focus, &:focus-within': {
                outline: 'none !important',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDarkMode ? alpha('#ffffff', 0.02) : alpha('#000000', 0.02),
              borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              minHeight: '52px !important',
              maxHeight: '52px !important',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none !important',
            },
            '& .MuiDataGrid-row': {
              transition: 'background-color 0.15s ease',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.primary.main, 0.06)
                  : alpha(theme.palette.primary.main, 0.03),
              },
              '&.Mui-selected': {
                backgroundColor: isDarkMode
                  ? alpha(theme.palette.primary.main, 0.12)
                  : alpha(theme.palette.primary.main, 0.07),
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? alpha(theme.palette.primary.main, 0.16)
                    : alpha(theme.palette.primary.main, 0.1),
                },
              },
            },
            '& .MuiCheckbox-root': {
              color: isDarkMode ? alpha('#ffffff', 0.3) : alpha('#000000', 0.3),
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              backgroundColor: isDarkMode ? alpha('#ffffff', 0.01) : alpha('#000000', 0.01),
            },
            '& .MuiTablePagination-root': {
              color: 'text.secondary',
            },
            '& .MuiTablePagination-selectIcon': {
              color: 'text.secondary',
            },
            '& .MuiDataGrid-iconSeparator': {
              color: isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1),
            },
          }}
        />
      </Box>
    </Paper>
  );
};

