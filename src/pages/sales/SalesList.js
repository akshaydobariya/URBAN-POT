import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';
import SalesContext from '../../context/SalesContext';

const SalesList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { sales, loading, error, getSales, deleteSale } = useContext(SalesContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  
  // Local state for filtered sales
  const [filteredSales, setFilteredSales] = useState([]);

  // Check if user can edit/delete
  const canEdit = user && (user.role === 'admin' || user.role === 'manager');
  const canDelete = user && user.role === 'admin';

  useEffect(() => {
    console.log('SalesList component mounted, fetching sales...');
    getSales();
  }, []);

  useEffect(() => {
    // Apply filters locally instead of fetching from server each time
    if (sales) {
      let filtered = [...sales];
      
      if (searchTerm) {
        filtered = filtered.filter(sale => 
          sale.customer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter) {
        filtered = filtered.filter(sale => 
          sale.status === statusFilter
        );
      }
      
      setFilteredSales(filtered);
      setTotalItems(filtered.length);
    }
  }, [sales, searchTerm, statusFilter]);

  const handleSearch = () => {
    // Just trigger the filter effect
    console.log('Searching for:', searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const handleDeleteClick = (sale) => {
    setSaleToDelete(sale);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSale(saleToDelete._id);
      setDeleteDialogOpen(false);
      setSaleToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 
        'Failed to delete sale'
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  const handleExportInvoice = async (id) => {
    try {
      const res = await axios.get(`/api/sales/${id}/invoice`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([res.data]));
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download invoice');
    }
  };

  const columns = [
    { 
      field: 'createdAt',
      headerName: 'Date',
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (params) => {
        try {
          if (!params.value) return 'N/A';
          const date = new Date(params.value);
          if (isNaN(date.getTime())) return 'Invalid date';
          return format(date, 'MMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Error';
        }
      }
    },
    { 
      field: 'customer', 
      headerName: 'Customer', 
      flex: 1, 
      minWidth: 150,
      valueGetter: (params) => params.row.customer?.name || 'N/A'
    },
    { 
      field: 'total', 
      headerName: 'Total', 
      flex: 0.6, 
      minWidth: 100,
      valueFormatter: (params) => `₹${params.value.toLocaleString('en-IN')}`
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      flex: 0.7, 
      minWidth: 120,
      renderCell: (params) => {
        let color = 'primary';
        
        switch (params.value) {
          case 'completed':
            color = 'success';
            break;
          case 'pending':
            color = 'warning';
            break;
          case 'cancelled':
            color = 'error';
            break;
          default:
            color = 'primary';
        }
        
        return (
          <Chip 
            label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
            color={color} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            color="primary" 
            onClick={() => navigate(`/sales/${params.row._id}`)}
            size="small"
            title="View"
          >
            <VisibilityIcon />
          </IconButton>
          
          {canEdit && (
            <IconButton 
              color="secondary" 
              onClick={() => navigate(`/sales/${params.row._id}/edit`)}
              size="small"
              title="Edit"
            >
              <EditIcon />
            </IconButton>
          )}
          
          <IconButton 
            color="primary" 
            onClick={() => handleExportInvoice(params.row._id)}
            size="small"
            title="Download Invoice"
          >
            <ReceiptIcon />
          </IconButton>
          
          {canDelete && (
            <IconButton 
              color="error" 
              onClick={() => handleDeleteClick(params.row)}
              size="small"
              title="Delete"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 1 : 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom sx={{ mr: 2 }}>
          Sales
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/sales/add')}
          size={isMobile ? "small" : "medium"}
          sx={{ mt: isMobile ? 1 : 0 }}
        >
          Add Sale
        </Button>
      </Box>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search sales..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {isMobile ? (
        // Mobile view - cards
        <Box>
          {filteredSales.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((sale) => (
            <Card key={sale._id} sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" component="div">
                  {sale.customer}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Date: {format(new Date(sale.createdAt), 'MMM dd, yyyy')}
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Total: ₹{sale.total.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Chip 
                      label={sale.status} 
                      color={
                        sale.status === 'Completed' ? 'success' : 
                        sale.status === 'Pending' ? 'warning' : 'error'
                      }
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/sales/${sale._id}`)}
                  color="primary"
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/sales/${sale._id}/edit`)}
                  color="secondary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteClick(sale)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
          
          {filteredSales.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              No sales found.
            </Typography>
          )}
        </Box>
      ) : (
        // Desktop view - table
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.length > 0 ? (
                  filteredSales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow key={sale._id}>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell>{format(new Date(sale.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>₹{sale.total.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sale.status} 
                            color={
                              sale.status === 'Completed' ? 'success' : 
                              sale.status === 'Pending' ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/sales/${sale._id}`)}
                            color="primary"
                          >
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/sales/${sale._id}/edit`)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(sale)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No sales found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      <TablePagination
        rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25]}
        component="div"
        count={filteredSales.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sale for {saleToDelete?.customer}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SalesList; 