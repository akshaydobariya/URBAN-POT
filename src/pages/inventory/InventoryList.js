import React, { useEffect, useContext, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Alert,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import InventoryContext from '../../context/InventoryContext';
import SeedData from '../../components/utils/SeedData';
import DebugPanel from '../../components/utils/DebugPanel';
import { toast } from 'react-toastify';

const InventoryList = () => {
  const { inventory, loading, error, getInventory, deleteInventoryItem } = useContext(InventoryContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [inventoryFetched, setInventoryFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  useEffect(() => {
    getInventory();
  }, []);
  
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
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteInventoryItem(itemToDelete._id);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 1 : 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom sx={{ mr: 2 }}>
          Inventory
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={forceRefresh}
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
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/inventory/add')}
            size={isMobile ? "small" : "medium"}
            sx={{ mt: isMobile ? 1 : 0 }}
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
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search inventory..."
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
          {filteredInventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
            <Card key={item._id} sx={{ mb: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" component="div">
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Category: {item.category}
                </Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Quantity: {item.quantity} {item.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Price: ₹{item.price.toLocaleString('en-IN')}
                    </Typography>
                  </Grid>
                </Grid>
                {item.quantity <= (item.reorderLevel || 5) && (
                  <Chip 
                    label={item.quantity === 0 ? "Out of Stock" : "Low Stock"} 
                    color={item.quantity === 0 ? "error" : "warning"}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/inventory/${item._id}`)}
                  color="primary"
                >
                  <ViewIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => navigate(`/inventory/${item._id}/edit`)}
                  color="secondary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteClick(item)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          ))}
          
          {filteredInventory.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
              No inventory items found.
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
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventory.length > 0 ? (
                  filteredInventory
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity} {item.unit}</TableCell>
                        <TableCell>₹{item.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          {item.quantity <= (item.reorderLevel || 5) && (
                            <Chip 
                              label={item.quantity === 0 ? "Out of Stock" : "Low Stock"} 
                              color={item.quantity === 0 ? "error" : "warning"}
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/inventory/${item._id}`)}
                            color="primary"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => navigate(`/inventory/${item._id}/edit`)}
                            color="secondary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(item)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No inventory items found.
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
        count={filteredInventory.length}
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
            Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add debug panel in development mode */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </Container>
  );
};

export default InventoryList; 