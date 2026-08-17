import React, { useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Category as CategoryIcon,
  FolderSpecial as FolderIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { mockCategories, type Category } from '../data/mockCategories';

export const Categories: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Auto-generate slug from name
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
    setDescription('');
    setImageUrl('');
    setStatus('Active');
    setFormError('');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description);
    setImageUrl(category.imageUrl || '');
    setStatus(category.status);
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size must be less than 5MB');
        toast.error('Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setFormError('');
        toast.success('Category image selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Category name is required.');
      toast.error('Category name is required.');
      return;
    }
    if (!slug.trim()) {
      setFormError('Category slug is required.');
      toast.error('Category slug is required.');
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingCategory.id
            ? {
              ...item,
              name: name.trim(),
              slug: slug.trim(),
              description: description.trim(),
              imageUrl: imageUrl.trim(),
              status,
            }
            : item
        )
      );
      toast.success(`Category "${name}" updated successfully!`);
    } else {
      const newCategory: Category = {
        id: `CAT-00${categories.length + 1}`,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        productCount: 0,
        status,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCategories((prev) => [newCategory, ...prev]);
      toast.success(`Category "${newCategory.name}" created successfully!`);
    }

    handleCloseModal();
  };

  // Delete Handlers
  const handleOpenDelete = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      setCategories((prev) => prev.filter((item) => item.id !== categoryToDelete.id));
      toast.error(`Category "${categoryToDelete.name}" deleted!`, { icon: '🗑️' });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Columns Definition
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'Category ID',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'name',
        headerName: 'Category Name',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar
              src={params.row.imageUrl}
              alt={params.value}
              sx={{
                width: 38,
                height: 38,
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
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {params.value}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'slug',
        headerName: 'Slug',
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={`/${params.value}`}
              size="small"
              variant="outlined"
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: '6px',
                borderColor: isDarkMode ? alpha('#ffffff', 0.2) : alpha('#000000', 0.15),
              }}
            />
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.5,
        minWidth: 250,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ display: 'block' }}
            >
              {params.value || 'No description provided.'}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'productCount',
        headerName: 'Products',
        width: 130,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={`${params.value} Items`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.75rem',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.06),
                borderRadius: '6px',
              }}
            />
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={params.value}
              color={params.value === 'Active' ? 'success' : 'default'}
              size="small"
              sx={{ fontWeight: 700, borderRadius: '6px' }}
            />
          </Box>
        ),
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
          <CategoryIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.02em' }}>
              Categories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Organize your catalog by creating, editing, and managing product categories.
            </Typography>
          </Box>
        </Box>

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

      {/* Main Data Table */}
      <CustomDataTable
        rows={categories}
        columns={columns}
        title="Product Categories"
        searchPlaceholder="Search categories by name, slug, or description..."
      />

      {/* Create / Edit Category Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
            boxShadow: isDarkMode ? '0 24px 48px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            width: '100%',
            color: 'text.primary',
            borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            sx={{
              color: 'text.secondary',
              ml: 'auto',
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

            {/* Category Image Picker */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                p: 2,
                borderRadius: '14px',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
              }}
            >
              <Avatar
                src={imageUrl}
                alt={name || 'Category'}
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  borderRadius: '12px',
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <FolderIcon fontSize="large" />
              </Avatar>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Category Thumbnail (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                  >
                    Upload Image
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>

                  {imageUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setImageUrl('')}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Category Name */}
            <TextField
              label="Category Name *"
              placeholder="e.g. Gaming Consoles"
              value={name}
              onChange={handleNameChange}
              fullWidth
              required
              variant="outlined"
            />

            {/* Slug */}
            <TextField
              label="URL Slug *"
              placeholder="e.g. gaming-consoles"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="URL friendly identifier used in site navigation"
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="Brief summary of items in this category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
            />

            {/* Status */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              borderTop: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
            }}
          >
            <Button onClick={handleCloseModal} variant="outlined" color="inherit" sx={{ borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
          },
        }}
      >
        <DialogTitle fontWeight={700} sx={{ color: 'text.primary' }}>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete category <strong>{categoryToDelete?.name}</strong> (
            {categoryToDelete?.id})? Products in this category may need re-assigning.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
