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
  TablePagination
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
  const { sales, loading, getSales, deleteSale } = useContext(SalesContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
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
      valueFormatter: (params) => `$${params.value.toFixed(2)}`
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Sales
        </Typography>
        
        {canEdit && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/sales/add"
          >
            New Sale
          </Button>
        )}
      </Box>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search Customer"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton
                    aria-label="search"
                    onClick={handleSearch}
                    edge="end"
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl sx={{ minWidth: '200px' }} size="small">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredSales}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50]}
          rowCount={totalItems}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this sale? This action cannot be undone.
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