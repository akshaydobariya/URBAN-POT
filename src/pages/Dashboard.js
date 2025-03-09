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
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  InventoryOutlined,
  AttachMoneyOutlined,
  ShoppingCartOutlined,
  WarningAmberOutlined,
  PeopleOutlined
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import AuthContext from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [dashboardData, setDashboardData] = useState(null);
  const [salesByPeriod, setSalesByPeriod] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('week');
  
  useEffect(() => {
    fetchDashboardData();
    fetchSalesByPeriod(period);
    fetchInventoryStatus();
  }, [period]);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard');
      setDashboardData(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching dashboard data');
      setLoading(false);
    }
  };
  
  const fetchSalesByPeriod = async (selectedPeriod) => {
    try {
      const res = await axios.get(`/api/dashboard/sales-by-period?period=${selectedPeriod}`);
      setSalesByPeriod(res.data.data);
    } catch (err) {
      console.error('Error fetching sales by period:', err);
    }
  };
  
  const fetchInventoryStatus = async () => {
    try {
      const res = await axios.get('/api/dashboard/inventory-status');
      setInventoryStatus(res.data.data);
    } catch (err) {
      console.error('Error fetching inventory status:', err);
    }
  };
  
  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  // Prepare data for sales chart
  const salesChartData = {
    labels: salesByPeriod.map(item => format(new Date(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Revenue',
        data: salesByPeriod.map(item => item.revenue),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for inventory chart
  const inventoryChartData = {
    labels: inventoryStatus?.categories.map(cat => cat.category) || [],
    datasets: [
      {
        label: 'Items by Category',
        data: inventoryStatus?.categories.map(cat => cat.count) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, px: isMobile ? 1 : 2 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
        {/* Inventory Card */}
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 100 : 140,
              justifyContent: 'center',
              bgcolor: 'info.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <InventoryOutlined sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : '2rem' }} />
              <Typography component="h2" variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                Inventory
              </Typography>
            </Box>
            <Typography component="p" variant={isMobile ? "body2" : "body1"} sx={{ mt: 1 }}>
              {dashboardData?.inventory?.totalItems || 0} items
            </Typography>
            <Typography component="p" variant={isMobile ? "body2" : "body1"}>
              ₹{dashboardData?.inventory?.totalValue?.toLocaleString('en-IN') || '0.00'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Sales Card */}
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 100 : 140,
              justifyContent: 'center',
              bgcolor: 'success.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <AttachMoneyOutlined sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : '2rem' }} />
              <Typography component="h2" variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                Sales
              </Typography>
            </Box>
            <Typography component="p" variant={isMobile ? "body2" : "body1"} sx={{ mt: 1 }}>
              {dashboardData?.sales?.totalSales || 0} total
            </Typography>
            <Typography component="p" variant={isMobile ? "body2" : "body1"}>
              ₹{dashboardData?.sales?.totalRevenue?.toLocaleString('en-IN') || '0'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Today's Sales Card */}
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 100 : 140,
              justifyContent: 'center',
              bgcolor: 'warning.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <ShoppingCartOutlined sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : '2rem' }} />
              <Typography component="h2" variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                Today
              </Typography>
            </Box>
            <Typography component="p" variant={isMobile ? "body2" : "body1"} sx={{ mt: 1 }}>
              {dashboardData?.sales?.todaySales || 0} sales
            </Typography>
            <Typography component="p" variant={isMobile ? "body2" : "body1"}>
              ₹{dashboardData?.sales?.todayRevenue?.toLocaleString('en-IN') || '0.00'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Low Stock Card */}
        <Grid item xs={6} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: isMobile ? 100 : 140,
              justifyContent: 'center',
              bgcolor: 'error.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <WarningAmberOutlined sx={{ mr: 1, fontSize: isMobile ? '1.5rem' : '2rem' }} />
              <Typography component="h2" variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                Low Stock
              </Typography>
            </Box>
            <Typography component="p" variant={isMobile ? "body2" : "body1"} sx={{ mt: 1 }}>
              {inventoryStatus?.lowStockCount || 0} items
            </Typography>
            <Typography component="p" variant={isMobile ? "body2" : "body1"}>
              {inventoryStatus?.outOfStockCount || 0} out of stock
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 3 }}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: isMobile ? 1 : 2, height: '100%' }}>
            <Box display="flex" flexDirection="column" height="100%">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} flexWrap="wrap">
                <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2">
                  Sales Trend
                </Typography>
                <ToggleButtonGroup
                  size={isMobile ? "small" : "medium"}
                  value={period}
                  exclusive
                  onChange={handlePeriodChange}
                  aria-label="time period"
                  sx={{ mb: isMobile ? 1 : 0 }}
                >
                  <ToggleButton value="week">Week</ToggleButton>
                  <ToggleButton value="month">Month</ToggleButton>
                  <ToggleButton value="year">Year</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ flexGrow: 1, minHeight: isMobile ? 200 : 300 }}>
                {salesByPeriod.length > 0 ? (
                  <Bar 
                    data={salesChartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: !isMobile,
                          position: 'top',
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + value;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography variant="body1" color="text.secondary">
                      No sales data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Inventory Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: isMobile ? 1 : 2, height: '100%' }}>
            <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2" gutterBottom>
              Inventory by Category
            </Typography>
            <Box sx={{ height: isMobile ? 200 : 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {inventoryStatus?.categories?.length > 0 ? (
                <Pie 
                  data={inventoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: isMobile ? 10 : 20,
                          font: {
                            size: isMobile ? 10 : 12
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No inventory data available
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Lists Section */}
      <Grid container spacing={isMobile ? 2 : 3}>
        {/* Low Stock Items */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2" gutterBottom>
                Low Stock Items
              </Typography>
              {inventoryStatus && inventoryStatus.lowStockCount > 0 ? (
                <List dense={isMobile}>
                  {inventoryStatus.categories
                    .filter(cat => cat.lowStock > 0)
                    .map((category, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemText
                            primary={`${category.category}`}
                            secondary={`${category.lowStock} items below reorder level`}
                            primaryTypographyProps={{ 
                              variant: isMobile ? 'body2' : 'body1',
                              fontWeight: 'medium'
                            }}
                            secondaryTypographyProps={{ 
                              variant: isMobile ? 'caption' : 'body2' 
                            }}
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                </List>
              ) : (
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                  No low stock items
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ p: isMobile ? 1 : 2, pt: 0 }}>
              <Button 
                size={isMobile ? "small" : "medium"} 
                onClick={() => navigate('/inventory')}
              >
                View All Inventory
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Recent Sales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography variant={isMobile ? "subtitle1" : "h6"} component="h2" gutterBottom>
                Recent Sales
              </Typography>
              {dashboardData?.sales?.recentSales && dashboardData.sales.recentSales.length > 0 ? (
                <List dense={isMobile}>
                  {dashboardData.sales.recentSales.map((sale, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText
                          primary={`${sale.customer} - ₹${sale.total.toLocaleString('en-IN')}`}
                          secondary={format(new Date(sale.date), 'MMM dd, yyyy HH:mm')}
                          primaryTypographyProps={{ 
                            variant: isMobile ? 'body2' : 'body1',
                            fontWeight: 'medium'
                          }}
                          secondaryTypographyProps={{ 
                            variant: isMobile ? 'caption' : 'body2' 
                          }}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
                  No recent sales
                </Typography>
              )}
            </CardContent>
            <CardActions sx={{ p: isMobile ? 1 : 2, pt: 0 }}>
              <Button 
                size={isMobile ? "small" : "medium"} 
                onClick={() => navigate('/sales')}
              >
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