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
  CircularProgress,
  Paper,
  Grid,
  Stack,
  Avatar,
  AvatarGroup,
  Autocomplete,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Web as WebIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  LocalOffer as LocalOfferIcon,
  Layers as LayersIcon,
  TrendingUp as TrendingUpIcon,
  ViewAgenda as ViewAgendaIcon,
  Inventory as InventoryIcon,
  AddShoppingCart as AddShoppingCartIcon,
  ShoppingBag as ShoppingBagIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { homeSectionService } from '../services/homeSectionService';
import { homeSectionProductService } from '../services/homeSectionProductService';
import { productService } from '../services/productService';
import type { HomeSection as HomeSectionType, HomeSectionProduct } from '../types/homeSection';
import type { Product } from '../types/product';

// Suggested tags for quick selection
const SUGGESTED_TAGS = ['trending', 'popular', 'featured', 'hot-deals', 'best-sellers', 'new-arrivals'];

export const HomeSection: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Data states
  const [sections, setSections] = useState<HomeSectionType[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State for Create/Edit Section
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<HomeSectionType | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State for Section
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Delete Section State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<HomeSectionType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Manage Products Drawer / Modal State
  const [manageProductsModalOpen, setManageProductsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSectionType | null>(null);
  const [sectionProducts, setSectionProducts] = useState<HomeSectionProduct[]>([]);
  const [loadingSectionProducts, setLoadingSectionProducts] = useState(false);
  const [productToAdd, setProductToAdd] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  // Fetch all home sections from API
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const data = await homeSectionService.getAllSections();
      setSections(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch home sections:', error);
      const message = error?.response?.data?.message || 'Failed to load home sections from server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all available products for dropdowns
  const fetchAvailableProducts = useCallback(async () => {
    try {
      const res = await productService.getAllProducts({ limit: 100 });
      if (res && Array.isArray(res.data)) {
        setAvailableProducts(res.data);
      }
    } catch (error) {
      console.warn('Could not load products list for selector:', error);
    }
  }, []);

  useEffect(() => {
    fetchSections();
    fetchAvailableProducts();
  }, [fetchSections, fetchAvailableProducts]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = sections.length;
    const uniqueTags = new Set(sections.map((s) => s.tag?.toLowerCase().trim()).filter(Boolean)).size;
    const totalLinkedProducts = sections.reduce(
      (acc, s) => acc + (s.homeSectionProducts ? s.homeSectionProducts.length : 0),
      0
    );

    return { total, uniqueTags, totalLinkedProducts };
  }, [sections]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingSection(null);
    setTitle('');
    setTag('');
    setDesc('');
    setSelectedProductIds([]);
    setFormError('');
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (section: HomeSectionType) => {
    setEditingSection(section);
    setTitle(section.title);
    setTag(section.tag);
    setDesc(section.desc);
    const existingProductIds = (section.homeSectionProducts || []).map((p) => p.productId);
    setSelectedProductIds(existingProductIds);
    setFormError('');
    setModalOpen(true);
  };

  // Close Create/Edit Modal
  const handleCloseModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingSection(null);
    setFormError('');
  };

  // Submit Create or Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!tag.trim()) {
      setFormError('Tag is required');
      return;
    }
    if (!desc.trim()) {
      setFormError('Description is required');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      if (editingSection) {
        // Update existing section
        const updated = await homeSectionService.updateSection(editingSection.id, {
          title: title.trim(),
          tag: tag.trim().toLowerCase(),
          desc: desc.trim(),
          productIds: selectedProductIds,
        });
        setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success('Home section updated successfully!');
      } else {
        // Create new section
        const created = await homeSectionService.createSection({
          title: title.trim(),
          tag: tag.trim().toLowerCase(),
          desc: desc.trim(),
          productIds: selectedProductIds,
        });
        setSections((prev) => [created, ...prev]);
        toast.success('Home section created successfully!');
      }

      handleCloseModal();
      fetchSections(); // refresh with populated products
    } catch (error: any) {
      console.error('Failed to save home section:', error);
      const message = error?.response?.data?.message || 'Failed to save home section. Please try again.';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (section: HomeSectionType) => {
    setSectionToDelete(section);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!sectionToDelete) return;

    try {
      setDeleting(true);
      await homeSectionService.deleteSection(sectionToDelete.id);
      setSections((prev) => prev.filter((s) => s.id !== sectionToDelete.id));
      toast.success(`Section "${sectionToDelete.title}" deleted successfully!`);
      setDeleteDialogOpen(false);
      setSectionToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete section:', error);
      const message = error?.response?.data?.message || 'Failed to delete home section';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Open Manage Products Modal for a Section
  const handleOpenManageProducts = async (section: HomeSectionType) => {
    setActiveSection(section);
    setManageProductsModalOpen(true);
    setProductToAdd(null);
    try {
      setLoadingSectionProducts(true);
      const productsData = await homeSectionProductService.getProductsBySectionId(section.id);
      setSectionProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error: any) {
      console.error('Failed to fetch section products:', error);
      // Fallback to embedded products if available
      setSectionProducts(section.homeSectionProducts || []);
    } finally {
      setLoadingSectionProducts(false);
    }
  };

  // Add Product to Active Section
  const handleAddProductToSection = async () => {
    if (!activeSection || !productToAdd) return;

    // Check if already in section
    const alreadyLinked = sectionProducts.some((sp) => sp.productId === productToAdd.id);
    if (alreadyLinked) {
      toast.warning(`Product "${productToAdd.name}" is already added to this section!`);
      return;
    }

    try {
      setAddingProduct(true);
      const newAssociation = await homeSectionProductService.linkProductToSection({
        homeSectionId: activeSection.id,
        productId: productToAdd.id,
      });

      // Merge product data if missing from response
      const itemWithProduct: HomeSectionProduct = {
        ...newAssociation,
        product: newAssociation.product || productToAdd,
      };

      setSectionProducts((prev) => [itemWithProduct, ...prev]);
      setProductToAdd(null);
      toast.success(`Added "${productToAdd.name}" to section!`);

      // Update in main list
      setSections((prev) =>
        prev.map((s) =>
          s.id === activeSection.id
            ? { ...s, homeSectionProducts: [itemWithProduct, ...(s.homeSectionProducts || [])] }
            : s
        )
      );
    } catch (error: any) {
      console.error('Failed to link product to section:', error);
      const msg = error?.response?.data?.message || 'Failed to link product to section';
      toast.error(msg);
    } finally {
      setAddingProduct(false);
    }
  };

  // Remove Product from Active Section
  const handleRemoveProductFromSection = async (association: HomeSectionProduct) => {
    if (!activeSection) return;

    try {
      setRemovingProductId(association.id || association.productId);
      
      if (association.id) {
        await homeSectionProductService.removeProductFromSection(association.id);
      } else {
        await homeSectionProductService.removeProductDirect(activeSection.id, association.productId);
      }

      setSectionProducts((prev) =>
        prev.filter((item) => (item.id ? item.id !== association.id : item.productId !== association.productId))
      );
      toast.success(`Removed product from section!`);

      // Update in main list
      setSections((prev) =>
        prev.map((s) =>
          s.id === activeSection.id
            ? {
                ...s,
                homeSectionProducts: (s.homeSectionProducts || []).filter((item) =>
                  item.id ? item.id !== association.id : item.productId !== association.productId
                ),
              }
            : s
        )
      );
    } catch (error: any) {
      console.error('Failed to remove product from section:', error);
      const msg = error?.response?.data?.message || 'Failed to remove product from section';
      toast.error(msg);
    } finally {
      setRemovingProductId(null);
    }
  };

  // Copy ID to clipboard
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.info('ID copied to clipboard!', { autoClose: 1500 });
  };

  // Helper for tag badge styling
  const getTagColor = (tagStr: string) => {
    const lower = (tagStr || '').toLowerCase();
    if (lower.includes('trend')) return { bg: alpha('#6366f1', 0.15), border: '#6366f1', text: '#818cf8' };
    if (lower.includes('pop')) return { bg: alpha('#ec4899', 0.15), border: '#ec4899', text: '#f472b6' };
    if (lower.includes('deal')) return { bg: alpha('#eab308', 0.15), border: '#eab308', text: '#facc15' };
    if (lower.includes('feat')) return { bg: alpha('#10b981', 0.15), border: '#10b981', text: '#34d399' };
    if (lower.includes('new')) return { bg: alpha('#06b6d4', 0.15), border: '#06b6d4', text: '#22d3ee' };
    return {
      bg: alpha(theme.palette.primary.main, 0.12),
      border: theme.palette.primary.main,
      text: theme.palette.primary.light || theme.palette.primary.main,
    };
  };

  // Products available to add to active section (not already in sectionProducts)
  const unlinkedProducts = useMemo(() => {
    const linkedIds = new Set(sectionProducts.map((sp) => sp.productId));
    return availableProducts.filter((p) => !linkedIds.has(p.id));
  }, [availableProducts, sectionProducts]);

  // DataGrid Columns Definition
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 130,
        renderCell: (params) => {
          const id = params.value as string;
          return (
            <Tooltip title={`Click to copy: ${id}`} arrow>
              <Box
                onClick={() => handleCopyId(id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <span>{id ? `${id.slice(0, 8)}...` : '—'}</span>
                <ContentCopyIcon sx={{ fontSize: 13, opacity: 0.7 }} />
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: 'title',
        headerName: 'Section Title',
        flex: 1.2,
        minWidth: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: '8px',
                backgroundColor: isDarkMode ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ViewAgendaIcon sx={{ fontSize: 18 }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {params.value}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'tag',
        headerName: 'Tag / Identifier',
        width: 160,
        renderCell: (params) => {
          const tagStyle = getTagColor(params.value);
          return (
            <Chip
              icon={<LocalOfferIcon sx={{ fontSize: '15px !important', color: `${tagStyle.text} !important` }} />}
              label={params.value || 'None'}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.82rem',
                backgroundColor: tagStyle.bg,
                border: `1px solid ${tagStyle.border}`,
                color: tagStyle.text,
                borderRadius: '6px',
                textTransform: 'lowercase',
              }}
            />
          );
        },
      },
      {
        field: 'homeSectionProducts',
        headerName: 'Associated Products',
        flex: 1.2,
        minWidth: 220,
        renderCell: (params) => {
          const section = params.row as HomeSectionType;
          const prods = section.homeSectionProducts || [];
          const count = prods.length;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Manage linked products" arrow>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ShoppingBagIcon sx={{ fontSize: 16 }} />}
                  onClick={() => handleOpenManageProducts(section)}
                  sx={{
                    borderRadius: '4px',
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    py: 0.4,
                    px: 1.2,
                    borderColor: count > 0 ? alpha(theme.palette.primary.main, 0.5) : alpha(theme.palette.divider, 0.6),
                    color: count > 0 ? 'primary.main' : 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {count} {count === 1 ? 'Product' : 'Products'}
                </Button>
              </Tooltip>

              {count > 0 && (
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.8rem' } }}>
                  {prods.map((sp) => (
                    <Tooltip key={sp.productId} title={sp.product?.name || 'Product'} arrow>
                      <Avatar
                        alt={sp.product?.name || 'Product'}
                        src={sp.product?.imgUrl || ''}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {(sp.product?.name || 'P')[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
                </AvatarGroup>
              )}
            </Box>
          );
        },
      },
      {
        field: 'desc',
        headerName: 'Description',
        flex: 1.4,
        minWidth: 220,
        renderCell: (params) => (
          <Tooltip title={params.value || ''} arrow placement="top-start">
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {params.value || '—'}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: 'updatedAt',
        headerName: 'Last Updated',
        width: 140,
        renderCell: (params) => (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {params.value ? dayjs(params.value).format('MMM DD, YYYY') : '—'}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        filterable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: (params) => {
          const section = params.row as HomeSectionType;
          return (
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Tooltip title="Manage Products" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleOpenManageProducts(section)}
                  sx={{
                    color: 'primary.main',
                    backgroundColor: isDarkMode ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.08),
                    '&:hover': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.primary.main, 0.2) : alpha(theme.palette.primary.main, 0.15),
                    },
                  }}
                >
                  <AddShoppingCartIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Section" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleOpenEdit(section)}
                  sx={{
                    color: 'info.main',
                    backgroundColor: isDarkMode ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.main, 0.08),
                    '&:hover': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.info.main, 0.2) : alpha(theme.palette.info.main, 0.15),
                    },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Section" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDelete(section)}
                  sx={{
                    color: 'error.main',
                    backgroundColor: isDarkMode ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.08),
                    '&:hover': {
                      backgroundColor: isDarkMode ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.error.main, 0.15),
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [isDarkMode, theme]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
      {/* Page Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '12px',
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
                color: theme.palette.primary.main,
                display: 'flex',
              }}
            >
              <WebIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.5px' }}>
              Home Sections & Products
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage homepage storefront display sections, product banners, and curated product collections.
          </Typography>
        </Box>

        {/* Top Actions */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSections}
            disabled={loading}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
              },
            }}
          >
            Add Section
          </Button>
        </Stack>
      </Box>

      {/* Overview Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : '#fff',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.8)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Sections
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'text.primary' }}>
                {stats.total}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <LayersIcon sx={{ fontSize: 26 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : '#fff',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.8)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Tags
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#38bdf8' }}>
                {stats.uniqueTags}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha('#38bdf8', 0.12),
                color: '#38bdf8',
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 26 }} />
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.6) : '#fff',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.8)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Products Linked
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#10b981' }}>
                {stats.totalLinkedProducts}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: alpha('#10b981', 0.12),
                color: '#10b981',
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 26 }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Data Table */}
      <CustomDataTable
        rows={sections}
        columns={columns}
        loading={loading}
        title="Configured Homepage Sections"
        subtitle="Manage sections and linked product collections for the TechFlix home screen"
        searchPlaceholder="Search sections by title, tag, or description..."
        onRefresh={fetchSections}
        height="650px"
      />

      {/* Create / Edit Section Dialog */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: {
          sx: {
            borderRadius: '20px',
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08)}`,
            boxShadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        } }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 3,
              pb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: 'primary.main',
                  display: 'flex',
                }}
              >
                {editingSection ? <EditIcon /> : <AddIcon />}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {editingSection ? 'Edit Home Section' : 'Create Home Section'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {editingSection ? `Updating section: ${editingSection.title}` : 'Add a new dynamic section to your home page'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseModal} disabled={saving} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }} onClose={() => setFormError('')}>
                {formError}
              </Alert>
            )}

            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {/* Section Title */}
              <TextField
                label="Section Title"
                placeholder="e.g. Trending Software Tools"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                disabled={saving}
                helperText="Display headline visible on the frontend"
              />

              {/* Tag / Category Identifier */}
              <Box>
                <TextField
                  label="Tag Identifier"
                  placeholder="e.g. trending, popular, featured"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.toLowerCase())}
                  fullWidth
                  required
                  disabled={saving}
                  helperText="Unique categorization tag (lowercase)"
                />
                {/* Quick suggestions */}
                <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.8 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5, fontWeight: 500 }}>
                    Suggestions:
                  </Typography>
                  {SUGGESTED_TAGS.map((suggestedTag) => (
                    <Chip
                      key={suggestedTag}
                      label={suggestedTag}
                      size="small"
                      clickable
                      onClick={() => setTag(suggestedTag)}
                      variant={tag === suggestedTag ? 'filled' : 'outlined'}
                      color={tag === suggestedTag ? 'primary' : 'default'}
                      sx={{ fontSize: '0.75rem', height: '22px' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Section Description */}
              <TextField
                label="Description"
                placeholder="e.g. Top picked productivity and developer tools curated for you."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                fullWidth
                multiline
                rows={2}
                required
                disabled={saving}
                helperText="Subtitle or description summarizing the section's contents"
              />

              {/* Associated Products Multi-Select */}
              <Box>
                <Autocomplete
                  multiple
                  options={availableProducts}
                  getOptionLabel={(option) => option.name}
                  value={availableProducts.filter((p) => selectedProductIds.includes(p.id))}
                  onChange={(_, newValue) => {
                    setSelectedProductIds(newValue.map((p) => p.id));
                  }}
                  disabled={saving}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Attach Products (Optional)"
                      placeholder="Select products to include in this section..."
                      helperText="You can also add or remove products anytime using the 'Manage Products' action"
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} key={option.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                        <Avatar
                          src={option.imgUrl || ''}
                          alt={option.name}
                          sx={{ width: 28, height: 28, borderRadius: '6px' }}
                        >
                          {option.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {option.category && typeof option.category === 'object'
                              ? option.category.name
                              : 'Product'}
                          </Typography>
                        </Box>
                      </Box>
                    </li>
                  )}
                  renderValue={(tagValue, getItemProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        {...getItemProps({ index })}
                        key={option.id}
                        avatar={<Avatar src={option.imgUrl || ''}>{option.name[0]}</Avatar>}
                        label={option.name}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    ))
                  }
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
            <Button
              onClick={handleCloseModal}
              disabled={saving}
              variant="outlined"
              sx={{ borderRadius: '10px', textTransform: 'none', px: 2.5 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="contained"
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                px: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              }}
            >
              {saving ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Saving...</span>
                </Box>
              ) : editingSection ? (
                'Save Changes'
              ) : (
                'Create Section'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Manage Products Modal */}
      <Dialog
        open={manageProductsModalOpen}
        onClose={() => setManageProductsModalOpen(false)}
        fullWidth
        maxWidth="md"
        slotProps={{ paper: {
          sx: {
            borderRadius: '20px',
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.08)}`,
          },
        } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <ShoppingBagIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Manage Section Products
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Section: <strong style={{ color: theme.palette.primary.main }}>{activeSection?.title}</strong> (Tag:{' '}
                <code>{activeSection?.tag}</code>)
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setManageProductsModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: 1 }}>
          {/* Quick Add Product Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: '14px',
              backgroundColor: isDarkMode ? alpha('#0f172a', 0.6) : alpha('#f8fafc', 0.8),
              border: `1px dashed ${isDarkMode ? alpha('#6366f1', 0.3) : alpha('#6366f1', 0.4)}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddShoppingCartIcon fontSize="small" sx={{ color: 'primary.main' }} />
              Add Product to this Section
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Autocomplete
                sx={{ flexGrow: 1, minWidth: 260 }}
                size="small"
                options={unlinkedProducts}
                getOptionLabel={(option) => `${option.name} ${option.category && typeof option.category === 'object' ? `(${option.category.name})` : ''}`}
                value={productToAdd}
                onChange={(_, val) => setProductToAdd(val)}
                disabled={addingProduct}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search product to add..." label="Select Product" />
                )}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <Avatar src={option.imgUrl || ''} sx={{ width: 28, height: 28, borderRadius: '6px' }}>
                        {option.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {option.category && typeof option.category === 'object' ? option.category.name : 'Product'}
                        </Typography>
                      </Box>
                    </Box>
                  </li>
                )}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProductToSection}
                disabled={!productToAdd || addingProduct}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  px: 2.5,
                  py: 1,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                }}
              >
                {addingProduct ? <CircularProgress size={20} color="inherit" /> : 'Link Product'}
              </Button>
            </Box>
          </Paper>

          {/* Currently Linked Products List */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Linked Products ({sectionProducts.length})
            </Typography>
            {loadingSectionProducts && <CircularProgress size={18} />}
          </Box>

          {sectionProducts.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? alpha('#000000', 0.2) : alpha('#f1f5f9', 0.6),
                border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.6)}`,
              }}
            >
              <InventoryIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                No products are currently attached to this section.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Use the search dropdown above to add products to the homepage section.
              </Typography>
            </Box>
          ) : (
            <Paper
              elevation={0}
              sx={{
                maxHeight: 380,
                overflowY: 'auto',
                borderRadius: '12px',
                backgroundColor: isDarkMode ? alpha('#0f172a', 0.4) : '#fff',
                border: `1px solid ${isDarkMode ? alpha(theme.palette.divider, 0.1) : alpha(theme.palette.divider, 0.6)}`,
              }}
            >
              <List disablePadding>
                {sectionProducts.map((item, index) => {
                  const prod = item.product;
                  const isRemoving = removingProductId === (item.id || item.productId);
                  return (
                    <React.Fragment key={item.id || item.productId || index}>
                      <ListItem sx={{ py: 1.5, px: 2 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={prod?.imgUrl || ''}
                            alt={prod?.name || 'Product'}
                            variant="rounded"
                            sx={{ width: 44, height: 44, borderRadius: '8px' }}
                          >
                            {(prod?.name || 'P')[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                {prod?.name || item.productId}
                              </Typography>
                              {prod?.category && (
                                <Chip
                                  label={typeof prod.category === 'object' ? prod.category.name : prod.category}
                                  size="small"
                                  sx={{ fontSize: '0.72rem', height: '20px' }}
                                />
                              )}
                              {prod?.stock !== undefined && (
                                <Chip
                                  label={prod.stock ? 'In Stock' : 'Out of Stock'}
                                  size="small"
                                  color={prod.stock ? 'success' : 'default'}
                                  variant="outlined"
                                  sx={{ fontSize: '0.72rem', height: '20px' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 450,
                              }}
                            >
                              {prod?.smallDesc || `Product ID: ${item.productId}`}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Remove product from this section" arrow>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => handleRemoveProductFromSection(item)}
                              disabled={isRemoving}
                              sx={{
                                color: 'error.main',
                                backgroundColor: isDarkMode ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.error.main, 0.08),
                                '&:hover': {
                                  backgroundColor: isDarkMode ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.error.main, 0.15),
                                },
                              }}
                            >
                              {isRemoving ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < sectionProducts.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setManageProductsModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: '10px', textTransform: 'none', px: 3 }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Section Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        slotProps={{ paper: {
          sx: {
            borderRadius: '16px',
            p: 1,
            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
          },
        } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main' }}>
          <DeleteIcon />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Delete Home Section
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to permanently delete{' '}
            <strong style={{ color: isDarkMode ? '#fff' : '#000' }}>
              "{sectionToDelete?.title}"
            </strong>
            ? This will also remove all product associations for this section.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleting}
            variant="contained"
            color="error"
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Section'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeSection;
