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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  CardMedia,
  LinearProgress,
  Divider,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  Inventory2 as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Loyalty as LoyaltyIcon,
  InfoOutlined as InfoIcon,
  FeaturedPlayList as FeaturesIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { CustomDataTable } from '../components/common/CustomDataTable';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { imgUploadService } from '../services/imgUploadService';
import type { Product, ProductPlan } from '../types/product';
import type { Category } from '../types/category';

export const Products: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State for Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Preview Modal State
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form Field States
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [smallDesc, setSmallDesc] = useState('');
  const [longDesc, setLongDesc] = useState('');
  const [stock, setStock] = useState<boolean>(true);
  const [types, setTypes] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [plans, setPlans] = useState<ProductPlan[]>([]);
  const [formError, setFormError] = useState('');

  // New Plan Input State
  const [planTitle, setPlanTitle] = useState('');
  const [planPrice, setPlanPrice] = useState<string>('');
  const [planValidity, setPlanValidity] = useState('');
  const [planDurationDays, setPlanDurationDays] = useState<string>('');

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch Categories for Dropdown mapping
  const fetchCategoriesList = useCallback(async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn('Could not load categories list:', error);
    }
  }, []);

  // Fetch Products from API with filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams: any = {};
      if (selectedCategoryId !== 'ALL') {
        queryParams.categoryId = selectedCategoryId;
      }
      if (stockFilter !== 'ALL') {
        queryParams.stock = stockFilter === 'IN_STOCK';
      }
      if (searchTerm.trim()) {
        queryParams.search = searchTerm.trim();
      }

      const res = await productService.getAllProducts(queryParams);
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      const message = error?.response?.data?.message || 'Failed to load products from server';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, stockFilter, searchTerm]);

  useEffect(() => {
    fetchCategoriesList();
  }, [fetchCategoriesList]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setImgUrl('');
    setSmallDesc('');
    setLongDesc('');
    setStock(true);
    setTypes(['ott', 'subscription']);
    setTypeInput('');
    setFeatures(['Instant activation', 'HD & 4K streaming support', 'Multiple device access']);
    setFeatureInput('');
    setPlans([
      { title: '1 Month', price: 199, validity: '30 days', durationDays: 30 },
      { title: '3 Months', price: 499, validity: '90 days', durationDays: 90 },
      { title: 'Annual Plan', price: 999, validity: '365 days', durationDays: 365 },
    ]);
    setPlanTitle('');
    setPlanPrice('');
    setPlanValidity('');
    setPlanDurationDays('');
    setFormError('');
    setActiveTab(0);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name || '');
    setCategoryId(prod.categoryId || (prod.category?.id ?? ''));
    setImgUrl(prod.imgUrl || '');
    setSmallDesc(prod.smallDesc || '');
    setLongDesc(prod.longDesc || '');
    setStock(Boolean(prod.stock));
    setTypes(Array.isArray(prod.type) ? prod.type : []);
    setTypeInput('');
    setFeatures(Array.isArray(prod.features) ? prod.features : []);
    setFeatureInput('');
    setPlans(
      Array.isArray(prod.plans)
        ? prod.plans.map((p) => ({
          id: p.id,
          title: p.title || p.name || 'Standard Plan',
          name: p.name || p.title || 'Standard Plan',
          price: p.price,
          validity: p.validity || (p.durationDays ? `${p.durationDays} days` : ''),
          durationDays: p.durationDays,
        }))
        : []
    );
    setPlanTitle('');
    setPlanPrice('');
    setPlanValidity('');
    setPlanDurationDays('');
    setFormError('');
    setActiveTab(0);
    setModalOpen(true);
  };

  // Open Preview Modal
  const handleOpenPreview = (prod: Product) => {
    setPreviewProduct(prod);
    setPreviewOpen(true);
  };

  const handleCloseModal = () => {
    if (saving || uploadingImage) return;
    setModalOpen(false);
    setEditingProduct(null);
    setFormError('');
  };

  // Image Upload via Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setUploadingImage(true);
    setUploadProgress(0);
    setFormError('');

    try {
      const response = await imgUploadService.uploadImage(file, {
        folder: 'techflix/products',
        onUploadProgress: (progress) => {
          if (progress.total) {
            const percent = Math.round((progress.loaded * 100) / progress.total);
            setUploadProgress(percent);
          }
        },
      });

      if (response.success && response.url) {
        setImgUrl(response.url);
        toast.success('Product image uploaded successfully!');
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

  // Tag Management
  const handleAddType = () => {
    const trimmed = typeInput.trim().toLowerCase();
    if (trimmed && !types.includes(trimmed)) {
      setTypes([...types, trimmed]);
      setTypeInput('');
    }
  };

  const handleRemoveType = (t: string) => {
    setTypes(types.filter((item) => item !== t));
  };

  // Feature Management
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed) {
      setFeatures([...features, trimmed]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Plan Management (Listing Type Plans)
  const handleAddPlan = () => {
    if (!planTitle.trim()) {
      toast.error('Plan title is required (e.g. 1 Month, Annual Plan)');
      return;
    }
    const numPrice = Number(planPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error('Please enter a valid price for the plan');
      return;
    }

    const durationNum = planDurationDays ? Number(planDurationDays) : undefined;
    const newPlan: ProductPlan = {
      title: planTitle.trim(),
      name: planTitle.trim(),
      price: numPrice,
      validity: planValidity.trim() || (durationNum ? `${durationNum} days` : undefined),
      durationDays: durationNum,
    };

    setPlans([...plans, newPlan]);
    setPlanTitle('');
    setPlanPrice('');
    setPlanValidity('');
    setPlanDurationDays('');
    toast.success(`Plan "${newPlan.title}" added!`);
  };

  const handleRemovePlan = (index: number) => {
    setPlans(plans.filter((_, i) => i !== index));
  };

  // Submit Handler for Create / Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Product name is required.');
      toast.error('Product name is required.');
      setActiveTab(0);
      return;
    }
    if (!categoryId) {
      setFormError('Please select a category for this product.');
      toast.error('Category is required.');
      setActiveTab(0);
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      name: name.trim(),
      categoryId,
      imgUrl: imgUrl.trim() || undefined,
      smallDesc: smallDesc.trim() || undefined,
      longDesc: longDesc.trim() || undefined,
      stock,
      type: types,
      features,
      plans: plans.map((p) => ({
        id: p.id,
        title: p.title || p.name,
        name: p.name || p.title,
        price: Number(p.price),
        durationDays: p.durationDays ? Number(p.durationDays) : undefined,
        validity: p.validity,
      })),
    };

    try {
      if (editingProduct) {
        const updated = await productService.updateProduct(editingProduct.id, payload);
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? updated : item))
        );
        toast.success(`Product "${updated.name}" updated successfully!`);
      } else {
        const created = await productService.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        toast.success(`Product "${created.name}" created successfully!`);
      }

      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const message = error?.response?.data?.message || 'Failed to save product';
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleOpenDelete = (prod: Product) => {
    setProductToDelete(prod);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);

    try {
      await productService.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((item) => item.id !== productToDelete.id));
      toast.success(`Product "${productToDelete.name}" deleted successfully!`, { icon: '🗑️' });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const message = error?.response?.data?.message || 'Failed to delete product';
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  // Category name resolver
  const getCategoryName = useCallback(
    (prod: Product) => {
      if (prod.category && typeof prod.category === 'object' && prod.category.name) {
        return prod.category.name;
      }
      const matched = categories.find((c) => c.id === prod.categoryId);
      return matched ? matched.name : 'General';
    },
    [categories]
  );

  // Table Columns Definition
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'productInfo',
        headerName: 'Product',
        flex: 1.8,
        minWidth: 280,
        renderCell: (params) => {
          const prod = params.row as Product;
          const categoryTitle = getCategoryName(prod);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, height: '100%' }}>
              <Avatar
                src={prod.imgUrl || undefined}
                variant="rounded"
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                }}
              >
                <InventoryIcon fontSize="small" />
              </Avatar>
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {prod.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.25 }}>
                  <Chip
                    label={categoryTitle}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      color: theme.palette.primary.main,
                      borderRadius: '5px',
                    }}
                  />
                  {prod.smallDesc && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 160,
                      }}
                    >
                      {prod.smallDesc}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          );
        },
      },
      {
        field: 'stock',
        headerName: 'Stock Status',
        width: 140,
        renderCell: (params) => {
          const inStock = Boolean(params.value);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Chip
                icon={inStock ? <CheckCircleIcon sx={{ fontSize: '14px !important' }} /> : <CancelIcon sx={{ fontSize: '14px !important' }} />}
                label={inStock ? 'In Stock' : 'Out of Stock'}
                size="small"
                color={inStock ? 'success' : 'error'}
                variant={isDarkMode ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                }}
              />
            </Box>
          );
        },
      },
      {
        field: 'plans',
        headerName: 'Subscription Plans',
        flex: 1.4,
        minWidth: 230,
        sortable: false,
        renderCell: (params) => {
          const planList = (params.value as ProductPlan[]) || [];
          if (planList.length === 0) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  No plans configured
                </Typography>
              </Box>
            );
          }
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'nowrap', overflow: 'hidden', height: '100%' }}>
              {planList.slice(0, 2).map((plan, idx) => (
                <Chip
                  key={idx}
                  label={`${plan.title || plan.name || 'Plan'}: ₹${plan.price}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    borderRadius: '6px',
                    borderColor: isDarkMode ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.04) : alpha('#000000', 0.03),
                  }}
                />
              ))}
              {planList.length > 2 && (
                <Tooltip title={planList.map((p) => `${p.title || p.name}: ₹${p.price} (${p.validity || ''})`).join('\n')}>
                  <Chip
                    label={`+${planList.length - 2}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      borderRadius: '6px',
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      {
        field: 'type',
        headerName: 'Tags / Types',
        width: 170,
        sortable: false,
        renderCell: (params) => {
          const typeTags = (params.value as string[]) || [];
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%', overflow: 'hidden' }}>
              {typeTags.slice(0, 2).map((t, idx) => (
                <Chip
                  key={idx}
                  label={t}
                  size="small"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.06) : alpha('#000000', 0.06),
                  }}
                />
              ))}
              {typeTags.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{typeTags.length - 2}
                </Typography>
              )}
            </Box>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created Date',
        width: 150,
        renderCell: (params) => {
          const dateStr = params.value ? dayjs(params.value).format('MMM D, YYYY') : '—';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {dateStr}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 135,
        sortable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) => {
          const prod = params.row as Product;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, height: '100%' }}>
              <Tooltip title="Quick View">
                <IconButton
                  size="small"
                  onClick={() => handleOpenPreview(prod)}
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
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Product">
                <IconButton
                  size="small"
                  onClick={() => handleOpenEdit(prod)}
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
              <Tooltip title="Delete Product">
                <IconButton
                  size="small"
                  onClick={() => handleOpenDelete(prod)}
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
          );
        },
      },
    ],
    [theme, isDarkMode, getCategoryName]
  );

  // Derived KPI metrics
  const totalInStock = useMemo(() => products.filter((p) => p.stock).length, [products]);
  const totalPlansCount = useMemo(
    () => products.reduce((acc, p) => acc + (p.plans?.length || 0), 0),
    [products]
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <InventoryIcon sx={{ fontSize: 38, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Products & Plans
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage product listings, subscriptions, tier pricing, and digital catalog inventory.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Tooltip title="Refresh catalog">
            <IconButton
              onClick={fetchProducts}
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
            Create Product
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
              width: 46,
              height: 46,
              borderRadius: '12px',
            }}
          >
            <InventoryIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Total Products
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {products.length}
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
              width: 46,
              height: 46,
              borderRadius: '12px',
            }}
          >
            <CheckCircleIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              In Stock
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totalInStock}
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
              bgcolor: alpha(theme.palette.warning?.main || '#ed6c02', 0.12),
              color: theme.palette.warning?.main || '#ed6c02',
              width: 46,
              height: 46,
              borderRadius: '12px',
            }}
          >
            <LoyaltyIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Active Plans
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {totalPlansCount}
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
              width: 46,
              height: 46,
              borderRadius: '12px',
            }}
          >
            <CategoryIcon />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
              Categories
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {categories.length}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '16px',
          backgroundColor: isDarkMode ? '#121216' : '#ffffff',
          border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
          {/* Category Filter */}
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategoryId}
              label="Filter by Category"
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Stock Filter */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={stockFilter}
              label="Stock Status"
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="IN_STOCK">In Stock Only</MenuItem>
              <MenuItem value="OUT_OF_STOCK">Out of Stock</MenuItem>
            </Select>
          </FormControl>

          {/* Quick Search */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDarkMode ? alpha('#ffffff', 0.05) : alpha('#000000', 0.03),
              borderRadius: '10px',
              px: 1.5,
              border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
              minWidth: 240,
              flex: 1,
              maxWidth: 360,
            }}
          >
            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary', mr: 1 }} />
            <TextField
              placeholder="Search products or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="standard"
              fullWidth
              InputProps={{ disableUnderline: true }}
              sx={{ input: { fontSize: '0.875rem', py: 0.75 } }}
            />
            {searchTerm && (
              <IconButton size="small" onClick={() => setSearchTerm('')} sx={{ p: 0.5 }}>
                <ClearIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        {(selectedCategoryId !== 'ALL' || stockFilter !== 'ALL' || searchTerm) && (
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setSelectedCategoryId('ALL');
              setStockFilter('ALL');
              setSearchTerm('');
            }}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Clear Filters
          </Button>
        )}
      </Paper>

      {/* Main Data Table */}
      <CustomDataTable
        rows={products}
        columns={columns}
        loading={loading}
        title="Products Catalog"
        subtitle="Catalog list loaded directly from /api/products"
        searchPlaceholder="Search within loaded products..."
        onRefresh={fetchProducts}
      />

      {/* Create / Edit Modal (Tabs: Basic Details, Subscription Plans, Features & Tags) */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
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
            <InventoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {editingProduct ? 'Edit Product & Plans' : 'Create New Product'}
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

        {/* Modal Navigation Tabs */}
        <Box sx={{ borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`, px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.875rem',
                minHeight: 48,
              },
            }}
          >
            <Tab icon={<InfoIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="1. Basic Info & Media" />
            <Tab icon={<LoyaltyIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`2. Plans (${plans.length})`} />
            <Tab icon={<FeaturesIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`3. Features & Tags (${features.length})`} />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, maxHeight: '68vh', overflowY: 'auto' }}>
            {formError && (
              <Alert severity="error" sx={{ borderRadius: '10px' }}>
                {formError}
              </Alert>
            )}

            {/* TAB 0: Basic Info & Image */}
            {activeTab === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Product Name *"
                    placeholder="e.g. Netflix Premium 4K"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    disabled={saving}
                    variant="outlined"
                  />

                  <FormControl fullWidth required>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={categoryId}
                      label="Category *"
                      onChange={(e) => setCategoryId(e.target.value)}
                      disabled={saving}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Stock Toggle */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: '12px',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                    border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Inventory Stock Status
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Toggle whether customers can subscribe / purchase this item.
                    </Typography>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stock}
                        onChange={(e) => setStock(e.target.checked)}
                        color="success"
                        disabled={saving}
                      />
                    }
                    label={stock ? 'In Stock' : 'Out of Stock'}
                    sx={{ m: 0, '& .MuiFormControlLabel-label': { fontWeight: 700, fontSize: '0.85rem' } }}
                  />
                </Box>

                {/* Image Upload Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '14px',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.02) : alpha('#000000', 0.02),
                    border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Product Thumbnail Image
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: isDarkMode ? '#111116' : '#eef0f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                        flexShrink: 0,
                      }}
                    >
                      {uploadingImage ? (
                        <CircularProgress size={28} />
                      ) : imgUrl ? (
                        <CardMedia component="img" image={imgUrl} alt="Thumbnail" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <InventoryIcon sx={{ fontSize: 32, opacity: 0.35 }} />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          component="label"
                          variant="outlined"
                          size="small"
                          disabled={uploadingImage || saving}
                          startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                        >
                          {uploadingImage ? `Uploading ${uploadProgress}%` : 'Upload Image'}
                          <input type="file" hidden accept="image/*" onChange={handleImageFileChange} />
                        </Button>
                        {imgUrl && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => setImgUrl('')}
                            sx={{ textTransform: 'none' }}
                          >
                            Remove
                          </Button>
                        )}
                      </Box>
                      <TextField
                        label="or Direct Image URL"
                        placeholder="https://res.cloudinary.com/..."
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        fullWidth
                        size="small"
                        disabled={saving}
                      />
                    </Box>
                  </Box>

                  {uploadingImage && (
                    <LinearProgress
                      variant={uploadProgress > 0 ? 'determinate' : 'indeterminate'}
                      value={uploadProgress}
                      sx={{ borderRadius: 4, height: 6 }}
                    />
                  )}
                </Box>

                {/* Small Description */}
                <TextField
                  label="Short Description (smallDesc)"
                  placeholder="e.g. Ultra HD 4K streaming account with 4 screens."
                  value={smallDesc}
                  onChange={(e) => setSmallDesc(e.target.value)}
                  fullWidth
                  disabled={saving}
                  helperText="Brief summary shown on catalog cards."
                />

                {/* Long Description */}
                <TextField
                  label="Long Description (longDesc)"
                  placeholder="Full description detailing delivery, warranty, compatibility..."
                  value={longDesc}
                  onChange={(e) => setLongDesc(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={saving}
                  helperText="Extended product description displayed on details page."
                />
              </Box>
            )}

            {/* TAB 1: Subscription Plans */}
            {activeTab === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Plan Creation Form */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '14px',
                    backgroundColor: isDarkMode ? alpha('#ffffff', 0.03) : alpha('#000000', 0.02),
                    border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LoyaltyIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    Add New Subscription Plan
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr 1fr' }, gap: 1.5 }}>
                    <TextField
                      label="Plan Title / Name *"
                      placeholder="e.g. 1 Month / Annual Plan"
                      size="small"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                    />
                    <TextField
                      label="Price (₹ / $) *"
                      placeholder="199"
                      type="number"
                      size="small"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                    />
                    <TextField
                      label="Validity String"
                      placeholder="e.g. 30 days"
                      size="small"
                      value={planValidity}
                      onChange={(e) => setPlanValidity(e.target.value)}
                    />
                    <TextField
                      label="Duration (Days)"
                      placeholder="30"
                      type="number"
                      size="small"
                      value={planDurationDays}
                      onChange={(e) => setPlanDurationDays(e.target.value)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddPlan}
                      sx={{ borderRadius: '8px', fontWeight: 700, px: 2 }}
                    >
                      Add Plan to Product
                    </Button>
                  </Box>
                </Paper>

                {/* Configured Plans List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Configured Plans ({plans.length})
                  </Typography>

                  {plans.length === 0 ? (
                    <Box
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: `1px dashed ${isDarkMode ? alpha('#ffffff', 0.15) : alpha('#000000', 0.15)}`,
                        color: 'text.secondary',
                      }}
                    >
                      <LoyaltyIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">No subscription plans added yet.</Typography>
                      <Typography variant="caption">Use the form above to add pricing tiers (e.g. 1 Month, 3 Months, 1 Year).</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
                      {plans.map((plan, idx) => (
                        <Paper
                          key={idx}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            backgroundColor: isDarkMode ? '#181822' : '#f8f9fc',
                            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {plan.title || plan.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={`₹${plan.price}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 800, fontFamily: 'monospace', height: 22 }}
                              />
                              {(plan.validity || plan.durationDays) && (
                                <Typography variant="caption" color="text.secondary">
                                  {plan.validity || `${plan.durationDays} days`}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemovePlan(idx)}
                            sx={{
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.error.main, 0.12),
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* TAB 2: Features & Tags */}
            {activeTab === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Feature Bullet Points */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Product Feature Bullets ({features.length})
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="e.g. 4K Ultra HD + HDR, 4 Screens simultaneously"
                      size="small"
                      fullWidth
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddFeature}
                      sx={{ borderRadius: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      Add Feature
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {features.map((feat, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.2,
                          px: 1.8,
                          borderRadius: '10px',
                          backgroundColor: isDarkMode ? alpha('#ffffff', 0.04) : alpha('#000000', 0.03),
                          border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.07) : alpha('#000000', 0.07)}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                          <Typography variant="body2">{feat}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => handleRemoveFeature(idx)} sx={{ p: 0.5, color: 'text.secondary' }}>
                          <CloseIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ borderColor: isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08) }} />

                {/* Type Tags */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Product Tags / Types (e.g. ott, subscription, streaming)
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Type a tag name and click Add or press Enter"
                      size="small"
                      fullWidth
                      value={typeInput}
                      onChange={(e) => setTypeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddType();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleAddType}
                      sx={{ borderRadius: '8px', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      Add Tag
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {types.map((t, idx) => (
                      <Chip
                        key={idx}
                        label={t}
                        onDelete={() => handleRemoveType(t)}
                        sx={{ fontWeight: 600, borderRadius: '8px' }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              pt: 2,
              borderTop: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeTab > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveTab((prev) => prev - 1)}
                  sx={{ borderRadius: '10px' }}
                >
                  Previous Step
                </Button>
              )}
              {activeTab < 2 && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setActiveTab((prev) => prev + 1)}
                  sx={{ borderRadius: '10px' }}
                >
                  Next Step
                </Button>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
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
                {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* Product Quick View / Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            backgroundColor: isDarkMode ? '#16161d' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 2.5,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${isDarkMode ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08)}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Product Details Preview
          </Typography>
          <IconButton size="small" onClick={() => setPreviewOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {previewProduct && (
            <>
              {previewProduct.imgUrl && (
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    backgroundColor: isDarkMode ? '#111116' : '#eef0f5',
                    border: `1px solid ${isDarkMode ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1)}`,
                  }}
                >
                  <CardMedia component="img" image={previewProduct.imgUrl} alt={previewProduct.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    label={getCategoryName(previewProduct)}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                  />
                  <Chip
                    label={previewProduct.stock ? 'In Stock' : 'Out of Stock'}
                    size="small"
                    color={previewProduct.stock ? 'success' : 'error'}
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                  {previewProduct.name}
                </Typography>
                {previewProduct.smallDesc && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {previewProduct.smallDesc}
                  </Typography>
                )}
              </Box>

              {/* Plans Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Available Plans ({previewProduct.plans?.length || 0})
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {(previewProduct.plans || []).map((plan, i) => (
                    <Box
                      key={i}
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        backgroundColor: isDarkMode ? '#1e1e28' : '#f0f2f8',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {plan.title || plan.name}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        ₹{plan.price}
                      </Typography>
                      {(plan.validity || plan.durationDays) && (
                        <Typography variant="caption" color="text.secondary">
                          {plan.validity || `${plan.durationDays} days validity`}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Features List */}
              {previewProduct.features && previewProduct.features.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Features Included
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {previewProduct.features.map((f, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckIcon sx={{ color: 'success.main', fontSize: 16 }} />
                        <Typography variant="body2">{f}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>
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
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Delete Product?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete product <strong>{productToDelete?.name}</strong>?
            This will permanently remove the product and all associated subscription plans from the catalog.
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
            {deleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;
