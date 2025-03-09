import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  InputAdornment
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import SalesContext from '../../context/SalesContext';
import InventoryContext from '../../context/InventoryContext';
import { format } from 'date-fns';

const AddSale = () => {
  const navigate = useNavigate();
  const { createSale } = useContext(SalesContext);
  const { inventory, getInventory, loading: inventoryLoading } = useContext(InventoryContext);
  
  const [formData, setFormData] = useState({
    customer: '',
    items: [{ product: '', quantity: 1, price: 0, subtotal: 0 }],
    total: 0,
    paymentMethod: 'Cash',
    status: 'Completed',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [inventoryFetched, setInventoryFetched] = useState(false);
  
  // Use useCallback to prevent recreation of this function on every render
  const fetchInventory = useCallback(async () => {
    if (!inventoryFetched) {
      await getInventory();
      setInventoryFetched(true);
    }
  }, [getInventory, inventoryFetched]);
  
  useEffect(() => {
    const loadInventory = async () => {
      try {
        await fetchInventory();
        // Check if inventory is empty after fetching
        if (inventory.length === 0) {
          setError('No inventory items available. Please add inventory items first.');
        }
      } catch (err) {
        setError('Failed to load inventory. Please try again.');
      }
    };
    
    loadInventory();
  }, [fetchInventory, inventory.length]);
  
  const { customer, items, total, paymentMethod, status, notes } = formData;
  
  // Calculate subtotal for an item
  const calculateSubtotal = (item) => {
    return item.quantity * item.price;
  };
  
  // Calculate total for all items
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };
  
  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle item selection
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...items];
    
    if (name === 'product') {
      // Find the selected product from inventory
      const selectedProduct = inventory.find(product => product._id === value);
      
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          product: value,
          price: selectedProduct.price,
          subtotal: selectedProduct.price * updatedItems[index].quantity
        };
      }
    } else if (name === 'quantity') {
      const quantity = parseInt(value) || 0;
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        subtotal: quantity * updatedItems[index].price
      };
    } else if (name === 'price') {
      const price = parseFloat(value) || 0;
      updatedItems[index] = {
        ...updatedItems[index],
        price,
        subtotal: price * updatedItems[index].quantity
      };
    }
    
    const newTotal = calculateTotal(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      total: newTotal
    });
  };
  
  // Add a new item row
  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...items, { product: '', quantity: 1, price: 0, subtotal: 0 }]
    });
  };
  
  // Remove an item row
  const removeItemRow = (index) => {
    if (items.length === 1) {
      return; // Don't remove the last row
    }
    
    const updatedItems = items.filter((_, i) => i !== index);
    const newTotal = calculateTotal(updatedItems);
    
    setFormData({
      ...formData,
      items: updatedItems,
      total: newTotal
    });
  };
  
  // Handle form submission - use useCallback to prevent multiple submissions
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent multiple submissions
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!customer.trim()) {
        throw new Error('Customer name is required');
      }
      
      if (items.some(item => !item.product)) {
        throw new Error('All items must have a product selected');
      }
      
      if (items.some(item => item.quantity <= 0)) {
        throw new Error('All items must have a quantity greater than 0');
      }
      
      await createSale(formData);
      navigate('/sales');
    } catch (err) {
      setError(err.message || 'Error creating sale');
      setIsSubmitting(false);
    }
  }, [createSale, customer, formData, isSubmitting, items, navigate]);
  
  // In your AddSale.js component, add this function to safely format dates
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };
  
  if (inventoryLoading && !inventoryFetched) {
    return <CircularProgress />;
  }
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Sale
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                name="customer"
                value={customer}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={handleChange}
                  label="Payment Method"
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Subtotal</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth>
                            <InputLabel>Product</InputLabel>
                            <Select
                              name="product"
                              value={item.product}
                              onChange={(e) => handleItemChange(index, e)}
                              label="Product"
                              required
                            >
                              {inventory.map((product) => (
                                <MenuItem key={product._id} value={product._id}>
                                  {product.name} (${product.price.toLocaleString('en-IN')})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, e)}
                            inputProps={{ min: 1 }}
                            required
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            name={`items.${index}.price`}
                            label="Price (₹)"
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, e)}
                            InputProps={{
                              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          ${item.subtotal.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            color="error" 
                            onClick={() => removeItemRow(index)}
                            disabled={items.length === 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Button
                startIcon={<AddIcon />}
                onClick={addItemRow}
                sx={{ mt: 2 }}
              >
                Add Item
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" align="right">
                Total: ₹{total.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Create Sale'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/sales')}
                sx={{ mt: 2, ml: 2 }}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddSale; 