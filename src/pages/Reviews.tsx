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
  LinearProgress,
  Rating,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  RateReview as RateReviewIcon,
  Refresh as RefreshIcon,
  Image as ImageIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { reviewService } from '../services/reviewService';
import { imgUploadService } from '../services/imgUploadService';
import type { Review } from '../types/review';

export const Reviews: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Data states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [starCount, setStarCount] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all reviews from backend
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAllReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      toast.error(error?.response?.data?.message || 'Failed to load reviews from server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Open Modal for Creating
  const handleOpenCreate = () => {
    setEditingReview(null);
    setName('');
    setRole('');
    setStarCount(5);
    setDescription('');
    setProfileUrl('');
    setFormError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEdit = (review: Review) => {
    setEditingReview(review);
    setName(review.name || '');
    setRole(review.role || '');
    setStarCount(typeof review.starCount === 'number' ? review.starCount : 5);
    setDescription(review.description || '');
    setProfileUrl(review.profileUrl || '');
    setFormError('');
    setUploadProgress(0);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving || uploadingImage) return;
    setModalOpen(false);
    setEditingReview(null);
    setFormError('');
  };

  // Cloudinary Image Upload via imgUploadService
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be selected again if needed
    e.target.value = '';

    setUploadingImage(true);
    setUploadProgress(0);
    setFormError('');

    try {
      const response = await imgUploadService.uploadImage(file, {
        folder: 'techflix/reviews',
        onUploadProgress: (progress) => {
          if (progress.total) {
            const percent = Math.round((progress.loaded * 100) / progress.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.success && response.url) {
        setProfileUrl(response.url);
        toast.success('Profile image uploaded successfully!');
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
    if (!name.trim()) {
      setFormError('Please enter a reviewer name.');
      toast.error('Please enter a reviewer name.');
      return;
    }
    if (!description.trim()) {
      setFormError('Please enter a review description.');
      toast.error('Please enter a review description.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingReview) {
        // Update Review
        const updated = await reviewService.updateReview(editingReview.id, {
          name: name.trim(),
          role: role.trim() || null,
          starCount: Number(starCount),
          description: description.trim(),
          profileUrl: profileUrl.trim() || null,
        });

        setReviews((prev) =>
          prev.map((item) => (item.id === editingReview.id ? updated : item))
        );
        toast.success('Review updated successfully!');
      } else {
        // Create Review
        const created = await reviewService.createReview({
          name: name.trim(),
          role: role.trim() || null,
          starCount: Number(starCount),
          description: description.trim(),
          profileUrl: profileUrl.trim() || null,
        });

        setReviews((prev) => [created, ...prev]);
        toast.success('New review created successfully!');
      }

      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving review:', error);
      const message = error?.response?.data?.message || 'Failed to save review';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleting(true);

    try {
      await reviewService.deleteReview(reviewToDelete.id);
      setReviews((prev) => prev.filter((item) => item.id !== reviewToDelete.id));
      toast.success(`Review by "${reviewToDelete.name}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (error: any) {
      console.error('Error deleting review:', error);
      const message = error?.response?.data?.message || 'Failed to delete review';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Format Date Helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  // Column Definitions
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 130,
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
                  maxWidth: 110,
                }}
              >
                {params.value ? `${params.value.slice(0, 8)}...` : '—'}
              </Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        field: 'name',
        headerName: 'Reviewer',
        flex: 1,
        minWidth: 200,
        renderCell: (params) => {
          const row = params.row as Review;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
              <Avatar
                src={row.profileUrl || undefined}
                alt={params.value || 'User'}
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                {params.value ? params.value.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="body2" fontWeight={600} color="text.primary" noWrap>
                  {params.value || 'Anonymous'}
                </Typography>
                {row.role && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {row.role}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'starCount',
        headerName: 'Rating',
        width: 160,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => {
          const stars = typeof params.value === 'number' ? params.value : 5;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, height: '100%' }}>
              <Rating
                value={stars}
                precision={0.5}
                readOnly
                size="small"
                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
              />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {stars}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'role',
        headerName: 'Role / Badge',
        width: 150,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            {params.value ? (
              <Chip
                label={params.value}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  borderColor: isDarkMode ? alpha('#ffffff', 0.2) : alpha('#000000', 0.15),
                  backgroundColor: isDarkMode ? alpha('#ffffff', 0.04) : alpha('#000000', 0.02),
                }}
              />
            ) : (
              <Typography variant="caption" color="text.disabled">
                None
              </Typography>
            )}
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Review Description',
        flex: 2,
        minWidth: 260,
        renderCell: (params) => (
          <Tooltip title={params.value || ''} arrow placement="top-start">
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  lineHeight: 1.4,
                }}
              >
                {params.value || 'No description provided.'}
              </Typography>
            </Box>
          </Tooltip>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Created At',
        width: 130,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {formatDate(params.value)}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 110,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: '100%' }}>
            <Tooltip title="Edit Review">
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(params.row as Review)}
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
            <Tooltip title="Delete Review">
              <IconButton
                size="small"
                onClick={() => handleOpenDelete(params.row as Review)}
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
      {/* Top Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <RateReviewIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.02em' }}>
              Customer Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage user testimonials, star ratings (0-5), roles, and Cloudinary avatars.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh reviews">
            <IconButton
              onClick={fetchReviews}
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
            Create Review
          </Button>
        </Box>
      </Box>

      {/* Main Data Table */}
      <CustomDataTable
        rows={reviews}
        columns={columns}
        loading={loading}
        title="All Reviews"
        subtitle="Manage customer testimonials and star ratings"
        searchPlaceholder="Search reviews by name, role, description..."
        onRefresh={fetchReviews}
      />

      {/* Create / Edit Review Dialog Modal */}
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
            justifyContent: 'space-between',
            borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RateReviewIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {editingReview ? 'Edit Review' : 'Create New Review'}
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

            {/* Profile Avatar Upload with imgUploadService */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2.5,
                p: 2,
                borderRadius: '14px',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.18) : alpha('#000000', 0.18)}`,
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={profileUrl || undefined}
                  alt={name || 'User'}
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    border: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  {uploadingImage ? (
                    <CircularProgress size={28} color="inherit" />
                  ) : name ? (
                    name.charAt(0).toUpperCase()
                  ) : (
                    <ImageIcon />
                  )}
                </Avatar>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Reviewer Avatar (Optional)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Upload directly to Cloudinary (Max size 5MB)
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    disabled={uploadingImage || saving}
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
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

                  {profileUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      disabled={uploadingImage || saving}
                      onClick={() => setProfileUrl('')}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                {uploadingImage && (
                  <LinearProgress
                    variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
                    value={uploadProgress}
                    sx={{ borderRadius: 4, height: 6, mt: 0.5 }}
                  />
                )}
              </Box>
            </Box>

            {/* Profile URL (Direct input or auto-filled by Cloudinary) */}
            <TextField
              label="Avatar Image URL (Auto-filled by upload or custom URL)"
              placeholder="https://res.cloudinary.com/..."
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              helperText="You can also paste a direct image URL here."
            />

            {/* Reviewer Name */}
            <TextField
              label="Reviewer Name"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            {/* Reviewer Role */}
            <TextField
              label="Role / Title (Optional)"
              placeholder="e.g. Full Stack Engineer, Verified Buyer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              variant="outlined"
            />

            {/* Star Rating Input (0 to 5) */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 2,
                borderRadius: '12px',
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  Star Rating (0 - 5)
                </Typography>
                <Chip
                  label={`${starCount} / 5 Stars`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.82rem' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Rating
                  name="review-star-rating"
                  value={starCount}
                  precision={1}
                  onChange={(_, newValue) => {
                    if (newValue !== null) {
                      setStarCount(newValue);
                    }
                  }}
                  size="large"
                  emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                />
                <Button
                  size="small"
                  variant="text"
                  color="inherit"
                  onClick={() => setStarCount(0)}
                  sx={{ fontSize: '0.85rem', textTransform: 'none', color: 'text.secondary' }}
                >
                  Set 0
                </Button>
              </Box>
            </Box>

            {/* Review Description */}
            <TextField
              label="Review Description"
              placeholder="Write the reviewer's testimonial or feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
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
              {saving ? 'Saving...' : editingReview ? 'Save Changes' : 'Create Review'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 1,
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
          },
        }}
      >
        <DialogTitle fontWeight={700} sx={{ color: 'text.primary' }}>
          Delete Review?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the review by{' '}
            <strong>{reviewToDelete?.name}</strong>? This will permanently remove it from the
            database.
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

export default Reviews;
