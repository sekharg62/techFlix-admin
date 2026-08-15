import React, { useState, useMemo } from 'react';
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
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { mockHeroSlides, type HeroSlide } from '../data/mockHeroSlides';

export const HeroSlides: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [slides, setSlides] = useState<HeroSlide[]>(mockHeroSlides);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form State: only Order No and Image
  const [order, setOrder] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

  // Sorted by Order No ascending
  const sortedSlides = useMemo(() => {
    return [...slides].sort((a, b) => a.order - b.order);
  }, [slides]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingSlide(null);
    setOrder(slides.length + 1);
    setImageUrl('');
    setFormError('');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setOrder(slide.order);
    setImageUrl(slide.imageUrl);
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSlide(null);
  };

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Image size must be under 8MB');
        toast.error('Image size must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setFormError('');
        toast.success('Slide banner image selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setFormError('Please select or enter an image for the slide.');
      toast.error('Slide image is required.');
      return;
    }

    if (editingSlide) {
      setSlides((prev) =>
        prev.map((item) =>
          item.id === editingSlide.id
            ? {
                ...item,
                order: Number(order),
                imageUrl: imageUrl.trim(),
              }
            : item
        )
      );
      toast.success(`Slide ${editingSlide.id} updated successfully!`);
    } else {
      const newSlide: HeroSlide = {
        id: `SLIDE-00${slides.length + 1}`,
        order: Number(order),
        imageUrl: imageUrl.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSlides((prev) => [...prev, newSlide]);
      toast.success(`New slide (${newSlide.id}) created!`);
    }

    handleCloseModal();
  };

  // Delete Action
  const handleOpenDelete = (slide: HeroSlide) => {
    setSlideToDelete(slide);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (slideToDelete) {
      setSlides((prev) => prev.filter((item) => item.id !== slideToDelete.id));
      toast.error(`Slide ${slideToDelete.id} deleted!`, { icon: '🗑️' });
    }
    setDeleteDialogOpen(false);
    setSlideToDelete(null);
  };

  // Table Columns - ONLY ID, Order No., Image, Actions
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'Slide ID',
        width: 130,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
              {params.value}
            </Typography>
          </Box>
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
              fontSize: '0.85rem',
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
        headerName: 'Slide Image',
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
                  borderRadius: '8px',
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
                  borderRadius: '8px',
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
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.02em' }}>
              Hero Slides
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload carousel images and set their display order numbers.
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
          Create Slide
        </Button>
      </Box>

      {/* Main Data Table */}
      <CustomDataTable
        rows={sortedSlides}
        columns={columns}
        title="Carousel Banners"
        searchPlaceholder="Search slides by ID or order number..."
      />

      {/* Create / Edit Slide Dialog Modal */}
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
            <ViewCarouselIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {editingSlide ? 'Edit Slide' : 'Create New Slide'}
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

            {/* Order No. Input */}
            <TextField
              label="Order No. *"
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              fullWidth
              required
              variant="outlined"
              helperText="Numerical sequence for ordering slides in carousel"
            />

            {/* Banner Image Preview & File Upload */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2,
                borderRadius: '14px',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                Slide Image *
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
                {imageUrl ? (
                  <CardMedia
                    component="img"
                    image={imageUrl}
                    alt="Slide preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                    <ImageIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography variant="body2">No image selected</Typography>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                >
                  Upload Image File
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>

                <Typography variant="caption" color="text.secondary">
                  or enter URL below
                </Typography>
              </Box>

              <TextField
                label="Image URL"
                placeholder="https://images.unsplash.com/..."
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
            <Button onClick={handleCloseModal} variant="outlined" color="inherit" sx={{ borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
            >
              {editingSlide ? 'Save Changes' : 'Create Slide'}
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
        <DialogTitle fontWeight={700} sx={{ color: 'text.primary' }}>Delete Hero Slide?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete slide <strong>{slideToDelete?.id}</strong> (Order #{slideToDelete?.order})?
            This action cannot be undone.
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
