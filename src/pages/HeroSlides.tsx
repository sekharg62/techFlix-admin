import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
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
  CardMedia,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ViewCarousel as ViewCarouselIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { heroSlideService } from '../services/heroSlideService';
import { imgUploadService } from '../services/imgUploadService';
import type { HeroSlide } from '../types/heroSlide';

export const HeroSlides: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Data states
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State: Order No and Image
  const [order, setOrder] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all slides from backend
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const data = await heroSlideService.getAllSlides();
      setSlides(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch hero slides:', error);
      toast.error(error?.response?.data?.message || 'Failed to load slides from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  // Sorted by Order No ascending
  const sortedSlides = useMemo(() => {
    return [...slides].sort((a, b) => a.order - b.order);
  }, [slides]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingSlide(null);
    // Find next available order number
    const maxOrder = slides.reduce((max, s) => (s.order > max ? s.order : max), 0);
    setOrder(maxOrder + 1);
    setImageUrl('');
    setFormError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setOrder(slide.order);
    setImageUrl(slide.imageUrl);
    setFormError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving || uploadingImage) return;
    setModalOpen(false);
    setEditingSlide(null);
    setFormError('');
  };

  // Cloudinary Image Upload via imgUploadService
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadingImage(true);
    setUploadProgress(0);
    setFormError('');

    try {
      const response = await imgUploadService.uploadImage(file, {
        folder: 'techflix/hero',
        onUploadProgress: (progress) => {
          if (progress.total) {
            const percent = Math.round((progress.loaded * 100) / progress.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.success && response.url) {
        setImageUrl(response.url);
        toast.success('Slide banner uploaded successfully!');
      } else {
        const errorMsg = response.message || 'Image upload failed';
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to upload image';
      setFormError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Handler for Create / Edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (order === undefined || isNaN(order) || order < 0) {
      setFormError('Please enter a valid positive order number.');
      toast.error('Order number must be 0 or greater.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Please select or upload an image for the slide.');
      toast.error('Slide image is required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingSlide) {
        // Update Slide
        const updated = await heroSlideService.updateSlide(editingSlide.id, {
          order: Number(order),
          imageUrl: imageUrl.trim(),
        });

        setSlides((prev) =>
          prev.map((item) => (item.id === editingSlide.id ? updated : item))
        );
        toast.success('Slide updated successfully!');
      } else {
        // Create Slide
        const created = await heroSlideService.createSlide({
          order: Number(order),
          imageUrl: imageUrl.trim(),
        });

        setSlides((prev) => [...prev, created]);
        toast.success('New slide created successfully!');
      }

      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving slide:', error);
      const message = error?.response?.data?.message || 'Failed to save slide';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleOpenDelete = (slide: HeroSlide) => {
    setSlideToDelete(slide);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!slideToDelete) return;
    setDeleting(true);

    try {
      await heroSlideService.deleteSlide(slideToDelete.id);
      setSlides((prev) => prev.filter((item) => item.id !== slideToDelete.id));
      toast.success(`Slide #${slideToDelete.order} deleted successfully!`);
      setDeleteDialogOpen(false);
      setSlideToDelete(null);
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      const message = error?.response?.data?.message || 'Failed to delete slide';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Table Columns - ONLY ID, Order No., Image, Actions
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'Slide ID',
        width: 140,
        renderCell: (params) => (
          <Tooltip title={params.value || ''} arrow>
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 120,
                }}
              >
                {params.value ? `${params.value.slice(0, 8)}...` : '—'}
              </Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        field: 'order',
        headerName: 'Order No.',
        width: 140,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Chip
            label={`#${params.value}`}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: '0.82rem',
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              px: 1,
            }}
          />
        ),
      },
      {
        field: 'imageUrl',
        headerName: 'Slide Image Banner',
        flex: 1,
        minWidth: 260,
        sortable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1, height: '100%' }}>
            <Box
              sx={{
                width: 220,
                height: 56,
                borderRadius: '10px',
                overflow: 'hidden',
                border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
                backgroundColor: isDarkMode ? '#1a1a20' : '#f0f0f5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {params.value ? (
                <CardMedia
                  component="img"
                  image={params.value}
                  alt={`Slide #${params.row.order}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <ImageIcon sx={{ color: 'text.secondary', opacity: 0.5 }} />
                </Box>
              )}
            </Box>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, height: '100%' }}>
            <Tooltip title="Edit Image / Order">
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(params.row as HeroSlide)}
                sx={{
                  color: 'text.secondary',
                  borderRadius: '4px',
                  p: 0.85,
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Slide">
              <IconButton
                size="small"
                onClick={() => handleOpenDelete(params.row as HeroSlide)}
                sx={{
                  color: 'text.secondary',
                  borderRadius: '4px',
                  p: 0.85,
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
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ViewCarouselIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: '700', letterSpacing: '-0.02em' }}>
              Hero Slides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload carousel images and set their display order numbers.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh slides">
            <IconButton
              onClick={fetchSlides}
              disabled={loading}
              sx={{
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
                p: 1.2,
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
            Create Slide
          </Button>
        </Box>
      </Box>

      {/* Main Data Table */}
      <CustomDataTable
        rows={sortedSlides}
        columns={columns}
        loading={loading}
        title="Carousel Banners"
        subtitle="Manage hero banner slides in sequential order"
        searchPlaceholder="Search slides by ID or order number..."
        onRefresh={fetchSlides}
      />

      {/* Create / Edit Slide Dialog Modal */}
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
            <ViewCarouselIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
              {editingSlide ? 'Edit Slide' : 'Create New Slide'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            disabled={saving || uploadingImage}
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

            {/* Order No. Input */}
            <TextField
              label="Order No. *"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              fullWidth
              required
              variant="outlined"
              helperText="Numerical sequence for ordering slides in carousel (1, 2, 3...)"
            />

            {/* Banner Image Preview & Cloudinary Upload */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2,
                borderRadius: '14px',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.18) : alpha('#000000', 0.18)}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Slide Banner Image *
              </Typography>

              <Box
                sx={{
                  width: '100%',
                  height: 180,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: isDarkMode ? '#111116' : '#eef0f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                }}
              >
                {uploadingImage ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={36} color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      Uploading to Cloudinary {uploadProgress > 0 ? `(${uploadProgress}%)` : ''}...
                    </Typography>
                  </Box>
                ) : imageUrl ? (
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt="Slide preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography variant="body2">No banner image selected</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={uploadingImage || saving}
                  startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  {uploadingImage ? `Uploading ${uploadProgress}%` : 'Upload to Cloudinary'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={uploadingImage || saving}
                  />
                </Button>

                {imageUrl && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    disabled={uploadingImage || saving}
                    onClick={() => setImageUrl('')}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                  >
                    Remove
                  </Button>
                )}

                <Typography variant="caption" color="text.secondary">
                  or paste a direct image URL below
                </Typography>
              </Box>

              {uploadingImage && (
                <LinearProgress
                  variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
                  value={uploadProgress}
                  sx={{ borderRadius: 4, height: 6 }}
                />
              )}

              <TextField
                label="Banner Image URL"
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
              />
            </Box>
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
              disabled={saving || uploadingImage}
              sx={{ borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving || uploadingImage}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
            >
              {saving ? 'Saving...' : editingSlide ? 'Save Changes' : 'Create Slide'}
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
          Delete Hero Slide?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete slide <strong>{slideToDelete?.id}</strong> (Order #{slideToDelete?.order})?
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

export default HeroSlides;
