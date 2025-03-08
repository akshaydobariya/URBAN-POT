import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  InventoryOutlined,
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  WarningAmberOutlined
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import AuthContext from '../../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch summary data
        const summaryRes = await axios.get('/api/dashboard/summary');
        setSummary(summaryRes.data.data);
        
        // Fetch low stock items
        const lowStockRes = await axios.get('/api/dashboard/low-stock');
        setLowStockItems(lowStockRes.data.data);
        
        // Fetch recent sales
        const recentSalesRes = await axios.get('/api/dashboard/recent-sales');
        setRecentSales(recentSalesRes.data.data);
        
        // Fetch top selling items if admin or manager
        if (user && (user.role === 'admin' || user.role === 'manager')) {
          const topSellingRes = await axios.get('/api/dashboard/top-selling');
          setTopSellingItems(topSellingRes.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Prepare chart data for top selling items
  const chartData = {
    labels: topSellingItems.map(item => item.item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: topSellingItems.map(item => item.totalQuantity),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Selling Items',
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'primary.light',
              color: 'white',
            }}
          >
            <Box display="flex" alignItems="center">
              <InventoryOutlined sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="inherit">
                Inventory Items
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {summary.totalItems}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Total Value: ${summary.totalInventoryValue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'success.light',
              color: 'white',
            }}
          >
            <Box display="flex" alignItems="center">
              <AttachMoneyOutlined sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="inherit">
                Today's Sales
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              ${summary.todaySalesTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Orders: {summary.todaySalesCount}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'info.light',
              color: 'white',
            }}
          >
            <Box display="flex" alignItems="center">
              <ShoppingCartOutlined sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="inherit">
                Monthly Sales
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              ${summary.monthSalesTotal.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Orders: {summary.monthSalesCount}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              bgcolor: 'warning.light',
              color: 'white',
            }}
          >
            <Box display="flex" alignItems="center">
              <WarningAmberOutlined sx={{ mr: 1 }} />
              <Typography component="h2" variant="h6" color="inherit">
                Low Stock Items
              </Typography>
            </Box>
            <Typography component="p" variant="h4" sx={{ mt: 2 }}>
              {summary.lowStockCount}
            </Typography>
            <Typography variant="body2" sx={{ mt: 'auto' }}>
              Requires attention
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Top Selling Items Chart */}
        {user && (user.role === 'admin' || user.role === 'manager') && (
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
              <div className="chart-container">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Paper>
          </Grid>
        )}
        
        {/* Low Stock Items */}
        <Grid item xs={12} md={user && (user.role === 'admin' || user.role === 'manager') ? 4 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Low Stock Items
              </Typography>
              {lowStockItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No low stock items
                </Typography>
              ) : (
                <List dense>
                  {lowStockItems.slice(0, 5).map((item) => (
                    <React.Fragment key={item._id}>
                      <ListItem>
                        <ListItemText
                          primary={item.name}
                          secondary={`Quantity: ${item.quantity} / Min: ${item.minimumStockLevel}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/inventory')}>
                View All Inventory
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Recent Sales */}
        <Grid item xs={12} md={user && (user.role === 'admin' || user.role === 'manager') ? 4 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Sales
              </Typography>
              {recentSales.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No recent sales
                </Typography>
              ) : (
                <List dense>
                  {recentSales.slice(0, 5).map((sale) => (
                    <React.Fragment key={sale._id}>
                      <ListItem>
                        <ListItemText
                          primary={`${sale.customer.name} - $${sale.total.toFixed(2)}`}
                          secondary={format(new Date(sale.createdAt), 'MMM dd, yyyy HH:mm')}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/sales')}>
                View All Sales
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 