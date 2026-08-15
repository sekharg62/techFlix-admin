import React, { useMemo } from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { CustomDataTable } from '../components/common/CustomDataTable';

const mockProducts = [
  { id: 'PROD-001', name: 'Sony PlayStation 5', category: 'Gaming', price: 499.99, stock: 45, status: 'Active' },
  { id: 'PROD-002', name: 'Xbox Series X', category: 'Gaming', price: 499.99, stock: 12, status: 'Low Stock' },
  { id: 'PROD-003', name: 'Apple MacBook Pro M3', category: 'Laptops', price: 1999.00, stock: 5, status: 'Low Stock' },
  { id: 'PROD-004', name: 'Dell XPS 15', category: 'Laptops', price: 1750.00, stock: 22, status: 'Active' },
  { id: 'PROD-005', name: 'Samsung Odyssey G9', category: 'Monitors', price: 1299.99, stock: 0, status: 'Out of Stock' },
  { id: 'PROD-006', name: 'LG C3 OLED TV', category: 'Televisions', price: 1499.00, stock: 30, status: 'Active' },
  { id: 'PROD-007', name: 'Apple AirPods Pro 2', category: 'Audio', price: 249.00, stock: 150, status: 'Active' },
  { id: 'PROD-008', name: 'Sony WH-1000XM5', category: 'Audio', price: 348.00, stock: 65, status: 'Active' },
  { id: 'PROD-009', name: 'Logitech MX Master 3S', category: 'Accessories', price: 99.99, stock: 85, status: 'Active' },
  { id: 'PROD-010', name: 'Keychron Q1 Pro', category: 'Accessories', price: 199.00, stock: 8, status: 'Low Stock' },
  { id: 'PROD-011', name: 'Nvidia RTX 4090', category: 'Components', price: 1599.00, stock: 2, status: 'Low Stock' },
  { id: 'PROD-012', name: 'AMD Ryzen 9 7950X', category: 'Components', price: 599.00, stock: 40, status: 'Active' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active': return 'success';
    case 'Low Stock': return 'warning';
    case 'Out of Stock': return 'error';
    default: return 'default';
  }
};

export const Products: React.FC = () => {
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'Product ID',
        width: 130,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
              {params.value}
            </Typography>
          </Box>
        ),
      },
      { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 200 },
      { field: 'category', headerName: 'Category', width: 150 },
      { 
        field: 'price', 
        headerName: 'Price', 
        width: 120, 
        type: 'number',
        valueFormatter: (value) => `$${value?.toFixed(2)}`
      },
      { field: 'stock', headerName: 'Stock', width: 100, type: 'number' },
      {
        field: 'status',
        headerName: 'Status',
        width: 150,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip 
              label={params.value} 
              color={getStatusColor(params.value) as any} 
              size="small" 
              sx={{ fontWeight: 600 }}
            />
          </Box>
        ),
      },
    ],
    []
  );

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="700">
          Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => toast.success('Add Product form ready')}
          sx={{ fontWeight: 600 }}
        >
          Add Product
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Manage your product inventory. Use the columns to sort, or the toolbar to search and filter products.
      </Typography>

      <CustomDataTable
        rows={mockProducts}
        columns={columns}
        title="Product Inventory"
        searchPlaceholder="Search products by name, category, ID..."
        onRefresh={() => {
          toast.success('Product list refreshed!');
        }}
      />
    </Box>
  );
};
