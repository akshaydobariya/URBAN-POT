import React, { useState, useContext } from 'react';
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
  CircularProgress,
  Alert
} from '@mui/material';
import InventoryContext from '../../context/InventoryContext';

const categories = [
  'Electronics',
  'Furniture',
  'Office Supplies',
  'Clothing',
  'Food',
  'Beverages',
  'Other'
];

const units = [
  'piece',
  'kg',
  'liter',
  'box',
  'pack',
  'set',
  'pair',
  'meter',
  'unit'
];

const AddInventoryItem = () => {
  const navigate = useNavigate();
  const { createInventoryItem } = useContext(InventoryContext);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Other',
    description: '',
    quantity: 0,
    unit: 'piece',
    price: 0,
    cost: 0,
    supplier: '',
    reorderLevel: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { name, sku, category, description, quantity, unit, price, cost, supplier, reorderLevel } = formData;
  
  const handleChange = e => {
    const { name, value } = e.target;
    
    // Convert numeric fields to numbers
    if (['quantity', 'price', 'cost', 'reorderLevel'].includes(name)) {
      setFormData({ ...formData, [name]: Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setError('');
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      
      // Ensure numeric fields are valid numbers
      if (isNaN(quantity) || quantity < 0) {
        throw new Error('Quantity must be a valid number');
      }
      
      if (isNaN(price) || price < 0) {
        throw new Error('Price must be a valid number');
      }
      
      if (isNaN(cost) || cost < 0) {
        throw new Error('Cost must be a valid number');
      }
      
      if (isNaN(reorderLevel) || reorderLevel < 0) {
        throw new Error('Reorder level must be a valid number');
      }
      
      // Create inventory item
      console.log('Submitting inventory item:', formData);
      const result = await createInventoryItem(formData);
      console.log('Inventory item created successfully:', result);
      
      // Navigate after a short delay to ensure state updates
      setTimeout(() => {
        navigate('/inventory');
      }, 500);
    } catch (err) {
      console.error('Error creating inventory item:', err);
      setError(err.message || 'Error creating inventory item');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Add Inventory Item
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
                label="Name"
                name="name"
                value={name}
                onChange={handleChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={sku}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={category}
                onChange={handleChange}
              >
                {categories.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                name="supplier"
                value={supplier}
                onChange={handleChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                name="quantity"
                value={quantity}
                onChange={handleChange}
                inputProps={{ min: 0, step: 1 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Unit"
                name="unit"
                value={unit}
                onChange={handleChange}
              >
                {units.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Reorder Level"
                name="reorderLevel"
                value={reorderLevel}
                onChange={handleChange}
                inputProps={{ min: 0, step: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Price"
                name="price"
                value={price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Cost"
                name="cost"
                value={cost}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
              />
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
                {isSubmitting ? <CircularProgress size={24} /> : 'Add Item'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/inventory')}
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

export default AddInventoryItem; 