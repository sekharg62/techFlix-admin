import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  FolderSpecial as FolderIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Tag as TagIcon,
  Layers as LayersIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { categoryService } from '../services/categoryService';
import type { Category } from '../types/category';

export const Categories: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all categories from backend API
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      const message = error?.response?.data?.message || 'Failed to load categories from server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto-generate slug from name during creation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
    }
  };

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDesc('');
    setFormError('');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name || '');
    setSlug(category.slug || '');
    setDesc(category.desc || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    setFormError('');
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info(`Copied ${label} to clipboard!`, { autoClose: 1500 });
  };

  // Submit Handler for Create / Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      toast.error('Category name is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingCategory) {
        // Update category (PUT /api/categories/:id)
        const updated = await categoryService.updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || undefined,
          desc: desc.trim() || undefined,
        });

        setCategories((prev) =>
          prev.map((item) => (item.id === editingCategory.id ? updated : item))
        );
        toast.success(`Category "${updated.name}" updated successfully!`);
      } else {
        // Create category (POST /api/categories)
        const created = await categoryService.createCategory({
          name: name.trim(),
          slug: slug.trim() || undefined,
          desc: desc.trim() || undefined,
        });

        setCategories((prev) => [created, ...prev]);
        toast.success(`Category "${created.name}" created successfully!`);
      }

      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const message = error?.response?.data?.message || 'Failed to save category';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);

    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((item) => item.id !== categoryToDelete.id));
      toast.success(`Category "${categoryToDelete.name}" deleted successfully!`, { icon: () => '🗑️' });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      const message = error?.response?.data?.message || 'Failed to delete category';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Table Columns Definition
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'Category ID',
        width: 150,
        renderCell: (params) => {
          const val = params.value as string;
          return (
            <Tooltip title={`Full ID: ${val} (Click to copy)`} arrow>
              <Box
                onClick={() => handleCopyText(val, 'ID')}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {val ? `${val.substring(0, 8)}...` : '—'}
                </Typography>
                <ContentCopyIcon sx={{ fontSize: 13, opacity: 0.5 }} />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: 'name',
        headerName: 'Category Name',
        flex: 1.2,
        minWidth: 220,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.15),
                color: theme.palette.primary.main,
                fontWeight: 700,
                borderRadius: '10px',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <FolderIcon fontSize="small" />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 700 }}>
                {params.value}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'slug',
        headerName: 'Slug',
        width: 190,
        renderCell: (params) => {
          const val = params.value as string;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Tooltip title="Click to copy slug" arrow>
                <Chip
                  icon={<TagIcon sx={{ fontSize: '15px !important' }} />}
                  label={val || '—'}
                  size="small"
                  onClick={() => handleCopyText(val, 'Slug')}
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.06) : alpha('#000000', 0.05),
                    borderColor: isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                />
              </Tooltip>
            </Box>
          );
        },
      },
      {
        field: 'desc',
        headerName: 'Description',
        flex: 1.8,
        minWidth: 260,
        renderCell: (params) => {
          const descriptionText = params.value as string | undefined | null;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              {descriptionText ? (
                <Tooltip title={descriptionText} arrow placement="top-start">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ display: 'block', maxWidth: '100%' }}
                  >
                    {descriptionText}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  No description
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 170,
        renderCell: (params) => {
          const date = params.value ? dayjs(params.value).format('MMM D, YYYY · HH:mm') : '—';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {date}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title="Edit Category">
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(params.row as Category)}
                sx={{
                  color: 'text.secondary',
                  borderRadius: '4px',
                  p: 0.75,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Category">
              <IconButton
                size="small"
                onClick={() => handleOpenDelete(params.row as Category)}
                sx={{
                  color: 'text.secondary',
                  borderRadius: '4px',
                  p: 0.75,
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: alpha(theme.palette.error.main, 0.12),
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [theme, isDarkMode]
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CategoryIcon sx={{ fontSize: 38, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: '700', letterSpacing: '-0.02em' }}>
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage product taxonomies, hierarchy, and URL slugs for your catalog.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh categories">
            <IconButton
              onClick={fetchCategories}
              disabled={loading}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
                p: 1.2,
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
              }}
            >
              <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
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
            Create Category
          </Button>
        </Box>
      </Box>

      {/* Summary KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#131318' : '#ffffff',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              width: 48,
              height: 48,
              borderRadius: '12px',
            }}
          >
            <LayersIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Total Categories
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {categories.length}
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#131318' : '#ffffff',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.success?.main || '#2e7d32', 0.12),
              color: theme.palette.success?.main || '#2e7d32',
              width: 48,
              height: 48,
              borderRadius: '12px',
            }}
          >
            <TagIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Active Slugs
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {categories.filter((c) => !!c.slug).length}
            </Typography>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#131318' : '#ffffff',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: alpha(theme.palette.info?.main || '#0288d1', 0.12),
              color: theme.palette.info?.main || '#0288d1',
              width: 48,
              height: 48,
              borderRadius: '12px',
            }}
          >
            <ScheduleIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Latest Added
            </Typography>
            <Typography variant="body1" noWrap sx={{ fontWeight: 700, maxWidth: 180 }}>
              {categories.length > 0 ? categories[0].name : 'None'}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Main Data Table */}
      <CustomDataTable
        rows={categories}
        columns={columns}
        loading={loading}
        title="Catalog Categories"
        subtitle="Live catalog records synced from /api/categories"
        searchPlaceholder="Search categories by name, slug, or description..."
        onRefresh={fetchCategories}
      />

      {/* Create / Edit Category Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: {
          sx: {
            borderRadius: '20px',
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
            boxShadow: isDarkMode ? '0 24px 48px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.15)',
          },
        } }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            disabled={saving}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08),
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: '10px' }}>
                {formError}
              </Alert>
            )}

            {/* Category Name */}
            <TextField
              label="Category Name *"
              placeholder="e.g. Web Development"
              value={name}
              onChange={handleNameChange}
              fullWidth
              required
              disabled={saving}
              variant="outlined"
              autoFocus
            />

            {/* Slug */}
            <TextField
              label="URL Slug"
              placeholder="e.g. web-development (auto-generated if empty)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              fullWidth
              disabled={saving}
              variant="outlined"
              helperText="Optional identifier for URL routing. Leave blank to auto-generate from name."
            />

            {/* Description (desc) */}
            <TextField
              label="Description (desc)"
              placeholder="Courses and tutorials about web technologies..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={saving}
              variant="outlined"
              helperText="Optional summary explaining this category."
            />
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              borderTop: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            }}
          >
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              color="inherit"
              disabled={saving}
              sx={{ borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
            >
              {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        slotProps={{ paper: {
          sx: {
            borderRadius: '16px',
            p: 1,
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
          },
        } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Delete Category?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong> (
            <span>{categoryToDelete?.slug}</span>)?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ fontWeight: 700 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
