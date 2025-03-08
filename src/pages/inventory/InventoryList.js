import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import InventoryContext from '../../context/InventoryContext';
import SeedData from '../../components/utils/SeedData';
import DebugPanel from '../../components/utils/DebugPanel';
import { toast } from 'react-toastify';

const InventoryList = () => {
  const { inventory, loading, error, getInventory, deleteInventoryItem } = useContext(InventoryContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [inventoryFetched, setInventoryFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  
  // Force refresh when navigating to this page
  useEffect(() => {
    setInventoryFetched(false);
  }, [location]);
  
  // Use useCallback to prevent recreation of this function on every render
  const fetchInventory = useCallback(async () => {
    if (!inventoryFetched) {
      try {
        await getInventory();
        setInventoryFetched(true);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    }
  }, [getInventory, inventoryFetched]);
  
  // Only fetch inventory once when component mounts or when inventoryFetched changes
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory, inventoryFetched]);
  
  // Filter inventory when search term or inventory changes
  useEffect(() => {
    if (inventory) {
      setFilteredInventory(
        inventory.filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [inventory, searchTerm]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  
  // Manual refresh function
  const handleRefresh = () => {
    setInventoryFetched(false);
  };
  
  // Use useCallback for delete to prevent recreation on every render
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteInventoryItem(id);
      } catch (err) {
        console.error('Error deleting item:', err);
      }
    }
  }, [deleteInventoryItem]);
  
  const forceRefresh = async () => {
    try {
      setInventoryFetched(false);
      setIsLoading(true);
      await getInventory();
      toast.success('Inventory refreshed');
    } catch (err) {
      toast.error('Failed to refresh inventory');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (loading && !inventoryFetched) {
    return <CircularProgress />;
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Inventory
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={forceRefresh}
            sx={{ mr: 2 }}
          >
            Force Refresh
          </Button>
          <Button
            component={Link}
            to="/inventory/add"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Item
          </Button>
        </Box>
      </Box>
      
      {inventory.length === 0 && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your inventory is empty. Add some items or use the button below to add sample data.
          </Alert>
          <SeedData />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInventory.length > 0 ? (
                filteredInventory
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item._id}>
                      <TableCell component="th" scope="row">
                        <Link to={`/inventory/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>${item.price.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{item.supplier || 'N/A'}</TableCell>
                      <TableCell>
                        <IconButton
                          component={Link}
                          to={`/inventory/${item._id}/edit`}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(item._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {searchTerm ? 'No matching items found' : 'No inventory items available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInventory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add debug panel in development mode */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </Container>
  );
};

export default InventoryList; 