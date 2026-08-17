import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Switch,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import {
  Web as WebIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DragHandle as DragHandleIcon,
  Layers as LayersIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface SectionItem {
  id: string;
  name: string;
  type: string;
  itemCount: number;
  enabled: boolean;
  order: number;
}

const mockSections: SectionItem[] = [
  { id: 'SEC-001', name: 'Hero Slides Carousel', type: 'Carousel Banner', itemCount: 4, enabled: true, order: 1 },
  { id: 'SEC-002', name: 'Featured Categories Grid', type: 'Category Grid', itemCount: 6, enabled: true, order: 2 },
  { id: 'SEC-003', name: 'Top Trending Deals', type: 'Product Showcase', itemCount: 8, enabled: true, order: 3 },
  { id: 'SEC-004', name: 'Customer Testimonials', type: 'Reviews Carousel', itemCount: 6, enabled: true, order: 4 },
  { id: 'SEC-005', name: 'Newsletter Signup Box', type: 'CTA Banner', itemCount: 1, enabled: false, order: 5 },
];

export const HomeSection: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [sections, setSections] = useState<SectionItem[]>(mockSections);

  const handleToggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = !item.enabled;
          toast.success(`Section "${item.name}" ${newStatus ? 'enabled' : 'disabled'}!`, {
            icon: newStatus ? '👁️' : '🙈',
          });
          return { ...item, enabled: newStatus };
        }
        return item;
      })
    );
  };

  const handleAddSection = () => {
    toast.success('Create Home Section modal ready!');
  };

  const handleEditSection = (name: string) => {
    toast.success(`Editing section "${name}"`);
  };

  const handleDeleteSection = (id: string, name: string) => {
    setSections((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Section "${name}" removed from homepage!`, { icon: '🗑️' });
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WebIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.02em' }}>
              Home Section Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure homepage section blocks, layout sequence, and visibility options.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddSection}
          sx={{
            fontWeight: 700,
            px: 3,
            py: 1.2,
            borderRadius: '12px',
            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            '&:hover': {
              boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.5)}`,
            },
          }}
        >
          Add Home Section
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? '#121216' : '#ffffff',
              border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Total Sections
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {sections.length}
              </Typography>
            </Box>
            <LayersIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.8 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? '#121216' : '#ffffff',
              border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Active Sections
              </Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {sections.filter((s) => s.enabled).length}
              </Typography>
            </Box>
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.8 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? '#121216' : '#ffffff',
              border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Hidden Sections
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.secondary">
                {sections.filter((s) => !s.enabled).length}
              </Typography>
            </Box>
            <VisibilityOffIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.6 }} />
          </Paper>
        </Grid>
      </Grid>

      {/* Sections List Container */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: isDarkMode ? '#121216' : '#ffffff',
          border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          p: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Homepage Layout Structure
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sections are rendered on the store front in the order shown below. Use the toggle switch to show or hide sections.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map((section, index) => (
            <Card
              key={section.id}
              sx={{
                borderRadius: '12px',
                backgroundColor: isDarkMode ? '#1a1a22' : '#f8fafc',
                border: `1px solid ${section.enabled
                    ? isDarkMode
                      ? alpha(theme.palette.primary.main, 0.25)
                      : alpha(theme.palette.primary.main, 0.15)
                    : isDarkMode
                      ? alpha('#ffffff', 0.06)
                      : alpha('#000000', 0.06)
                  }`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
            >
              <CardContent
                sx={{
                  p: 2.5,
                  '&:last-child': { pb: 2.5 },
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Tooltip title="Drag to reorder">
                    <IconButton size="small" sx={{ color: 'text.secondary', cursor: 'grab' }}>
                      <DragHandleIcon />
                    </IconButton>
                  </Tooltip>

                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                    }}
                  />

                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                      {section.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.type} • {section.itemCount} Items
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color={section.enabled ? 'success.main' : 'text.secondary'} fontWeight={600}>
                      {section.enabled ? 'Visible' : 'Hidden'}
                    </Typography>
                    <Switch
                      checked={section.enabled}
                      onChange={() => handleToggleSection(section.id)}
                      color="primary"
                    />
                  </Box>

                  <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto' }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Tooltip title="Edit Section">
                      <IconButton
                        size="small"
                        onClick={() => handleEditSection(section.name)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1) },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete Section">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteSection(section.id, section.name)}
                        sx={{
                          color: 'text.secondary',
                          '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};
