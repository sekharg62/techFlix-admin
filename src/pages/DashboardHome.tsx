import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField
} from '@mui/material';
import {
  TrendingUp,
  PeopleAlt,
  AttachMoney,
  ShoppingCart
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const generateDailyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 5000) + 1000,
    });
  }
  return data;
};

const dailyData = generateDailyData();

const StatCard = ({ title, value, icon, trend, isPositive }: any) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography color="text.secondary" variant="subtitle2" fontWeight="600">
          {title}
        </Typography>
        <Box 
          sx={{ 
            backgroundColor: 'primary.main', 
            color: 'white', 
            p: 1, 
            borderRadius: 2,
            display: 'flex',
            opacity: 0.8
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
        {value}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: isPositive ? 'success.main' : 'error.main',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontWeight: '500'
        }}
      >
        {trend}
        <Typography component="span" variant="body2" color="text.secondary">
          vs last month
        </Typography>
      </Typography>
    </CardContent>
  </Card>
);

const recentOrders = [
  { id: 'ORD-001', customer: 'Alice Smith', date: '2023-10-25', amount: '$129.99', status: 'Completed' },
  { id: 'ORD-002', customer: 'Bob Johnson', date: '2023-10-24', amount: '$49.00', status: 'Processing' },
  { id: 'ORD-003', customer: 'Charlie Brown', date: '2023-10-24', amount: '$899.00', status: 'Shipped' },
  { id: 'ORD-004', customer: 'Diana Prince', date: '2023-10-23', amount: '$24.50', status: 'Completed' },
  { id: 'ORD-005', customer: 'Evan Wright', date: '2023-10-22', amount: '$199.99', status: 'Cancelled' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Processing': return 'warning';
    case 'Shipped': return 'info';
    case 'Cancelled': return 'error';
    default: return 'default';
  }
};

export const DashboardHome: React.FC = () => {
  const [startOpen, setStartOpen] = React.useState(false);
  const [endOpen, setEndOpen] = React.useState(false);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" fontWeight="700" sx={{ mb: 4 }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Revenue" 
            value="$45,231.89" 
            icon={<AttachMoney />} 
            trend="+20.1%" 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Active Users" 
            value="2,350" 
            icon={<PeopleAlt />} 
            trend="+15.5%" 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Sales" 
            value="12,234" 
            icon={<ShoppingCart />} 
            trend="+12.2%" 
            isPositive={true} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Conversion Rate" 
            value="3.24%" 
            icon={<TrendingUp />} 
            trend="-1.4%" 
            isPositive={false} 
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="600">
          Daily Order Value (Last 30 Days)
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker 
              label="Start Date" 
              defaultValue={dayjs('2023-09-25')}
              open={startOpen}
              onOpen={() => setStartOpen(true)}
              onClose={() => setStartOpen(false)}
              slotProps={{ 
                textField: { 
                  size: 'small', 
                  onClick: () => setStartOpen(true),
                  sx: { cursor: 'pointer', '& input': { cursor: 'pointer' } }
                } 
              }}
            />
            <DatePicker 
              label="End Date" 
              defaultValue={dayjs('2023-10-25')}
              open={endOpen}
              onOpen={() => setEndOpen(true)}
              onClose={() => setEndOpen(false)}
              slotProps={{ 
                textField: { 
                  size: 'small', 
                  onClick: () => setEndOpen(true),
                  sx: { cursor: 'pointer', '& input': { cursor: 'pointer' } }
                } 
              }}
            />
          </Box>
        </LocalizationProvider>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, height: 350, boxShadow: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#e50914" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#888" 
              tick={{ fill: '#888' }} 
              tickLine={false} 
              axisLine={false} 
              minTickGap={30}
            />
            <YAxis 
              stroke="#888" 
              tick={{ fill: '#888' }} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `$${value}`} 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#141414', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#e50914', fontWeight: 600 }}
              formatter={(value) => [`$${value}`, 'Order Value']}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
        Recent Orders
      </Typography>
      
      <TableContainer component={Paper} sx={{ boxShadow: 1, borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="recent orders table">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentOrders.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                  {row.id}
                </TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.amount}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    color={getStatusColor(row.status) as any} 
                    size="small" 
                    sx={{ fontWeight: 500, borderRadius: 1 }} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
