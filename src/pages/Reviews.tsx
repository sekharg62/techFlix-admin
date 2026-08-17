import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  alpha,
  Paper,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Star as StarIcon,
  RateReview as RateReviewIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { mockReviews, type Review } from '../data/mockReviews';

export const Reviews: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [starCount, setStarCount] = useState<number>(5);
  const [profileUrl, setProfileUrl] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Open Modal for Creating
  const handleOpenCreate = () => {
    setEditingReview(null);
    setName('');
    setRole('');
    setStarCount(5);
    setProfileUrl('');
    setComment('');
    setFormError('');
    setModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEdit = (review: Review) => {
    setEditingReview(review);
    setName(review.name);
    setRole(review.role);
    setStarCount(review.starCount);
    setProfileUrl(review.profileUrl || '');
    setComment(review.comment);
    setFormError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingReview(null);
  };

  // File Upload Handler for Profile Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size should be less than 5MB');
        toast.error('Image size must be under 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileUrl(reader.result as string);
        setFormError('');
        toast.success('Profile picture selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler for Create / Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a reviewer name.');
      toast.error('Please enter a reviewer name.');
      return;
    }
    if (!role.trim()) {
      setFormError('Please enter a role (e.g. VIP Subscriber, Verified Buyer).');
      toast.error('Please enter a role.');
      return;
    }

    if (editingReview) {
      // Edit existing review
      setReviews((prev) =>
        prev.map((item) =>
          item.id === editingReview.id
            ? {
              ...item,
              name: name.trim(),
              role: role.trim(),
              starCount,
              profileUrl: profileUrl.trim(),
              comment: comment.trim(),
            }
            : item
        )
      );
      toast.success(`Review ${editingReview.id} updated successfully!`);
    } else {
      // Create new review
      const newReview: Review = {
        id: `REV-00${reviews.length + 1}`,
        name: name.trim(),
        role: role.trim(),
        starCount,
        profileUrl: profileUrl.trim(),
        comment: comment.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setReviews((prev) => [newReview, ...prev]);
      toast.success(`New review (${newReview.id}) created successfully!`);
    }

    handleCloseModal();
  };

  // Open Delete Confirmation
  const handleOpenDelete = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (reviewToDelete) {
      setReviews((prev) => prev.filter((item) => item.id !== reviewToDelete.id));
      toast.error(`Review ${reviewToDelete.id} deleted!`, {
        icon: '🗑️',
      });
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  // Column Definitions
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 110,
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
        headerName: 'Reviewer Name',
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: '100%' }}>
            <Avatar
              src={params.row.profileUrl}
              alt={params.value}
              sx={{
                width: 36,
                height: 36,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.875rem',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {params.value ? params.value.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'starCount',
        headerName: 'Star Rating',
        width: 170,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
            <Rating
              value={Number(params.value)}
              precision={0.5}
              readOnly
              size="small"
              emptyIcon={<StarIcon style={{ opacity: 0.35 }} fontSize="inherit" />}
            />
            <Typography variant="body2" fontWeight={700} color="text.secondary">
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'role',
        headerName: 'Role',
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={params.value}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 600,
                borderRadius: '8px',
                fontSize: '0.75rem',
                borderColor: isDarkMode ? alpha('#ffffff', 0.2) : alpha('#000000', 0.15),
                backgroundColor: isDarkMode ? alpha('#ffffff', 0.04) : alpha('#000000', 0.02),
              }}
            />
          </Box>
        ),
      },
      {
        field: 'comment',
        headerName: 'Review Comment',
        flex: 1.5,
        minWidth: 260,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {params.value || 'No detailed feedback.'}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
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
            <Tooltip title="Delete Review">
              <IconButton
                size="small"
                onClick={() => handleOpenDelete(params.row as Review)}
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
          <RateReviewIcon sx={{ fontSize: 36, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ letterSpacing: '-0.02em' }}>
              Customer Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage product feedback, star ratings, and buyer testimonials.
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
          Create Review
        </Button>
      </Box>

      {/* Main Data Table */}
      <CustomDataTable
        rows={reviews}
        columns={columns}
        title="All Testimonials"
        searchPlaceholder="Search reviews by name, role, rating or text..."
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
            justify: 'space-between',
            width: '100%',
            color: 'text.primary',
            borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {editingReview ? 'Edit Review' : 'Create New Review'}
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

            {/* Profile Image File Upload Section */}
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
                src={profileUrl}
                alt={name || 'User'}
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  border: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </Avatar>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Profile Picture (Optional)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Upload File
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </Button>

                  {profileUrl && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={() => setProfileUrl('')}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Name Input */}
            <TextField
              label="Reviewer Name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            {/* Role Input */}
            <TextField
              label="Role / Badge"
              placeholder="e.g. Verified Buyer, VIP Subscriber"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            {/* Star Rating Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Rating Stars ({starCount} / 5)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Rating
                  value={starCount}
                  precision={0.5}
                  onChange={(_, newValue) => {
                    if (newValue !== null) setStarCount(newValue);
                  }}
                  size="large"
                  emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                />
                <Chip label={`${starCount} Stars`} size="small" color="primary" sx={{ fontWeight: 700 }} />
              </Box>
            </Box>

            {/* Comment / Review Text */}
            <TextField
              label="Review Content"
              placeholder="Write the reviewer's feedback here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              multiline
              rows={3}
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
            <Button onClick={handleCloseModal} variant="outlined" color="inherit" sx={{ borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: '10px', px: 3, fontWeight: 700 }}
            >
              {editingReview ? 'Save Changes' : 'Create Review'}
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
        <DialogTitle fontWeight={700} sx={{ color: 'text.primary' }}>Delete Review?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete review <strong>{reviewToDelete?.id}</strong> by{' '}
            <strong>{reviewToDelete?.name}</strong>? This action cannot be undone.
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
