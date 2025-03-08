import React, { useState, useContext } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import InventoryContext from '../../context/InventoryContext';

const sampleInventoryItems = [
  {
    name: 'Laptop - Dell XPS 13',
    description: 'High-performance laptop with 13-inch display, Intel Core i7, 16GB RAM, 512GB SSD',
    category: 'Electronics',
    price: 1299.99,
    quantity: 15,
    unit: 'piece',
    supplier: 'Dell Inc.',
    reorderLevel: 5
  },
  {
    name: 'Smartphone - Samsung Galaxy S21',
    description: 'Latest Samsung smartphone with 6.2-inch display, 8GB RAM, 128GB storage',
    category: 'Electronics',
    price: 899.99,
    quantity: 25,
    unit: 'piece',
    supplier: 'Samsung Electronics',
    reorderLevel: 8
  },
  {
    name: 'Office Chair - Ergonomic',
    description: 'Adjustable ergonomic office chair with lumbar support and breathable mesh',
    category: 'Furniture',
    price: 249.99,
    quantity: 10,
    unit: 'piece',
    supplier: 'Office Supplies Co.',
    reorderLevel: 3
  },
  {
    name: 'Wireless Headphones - Sony WH-1000XM4',
    description: 'Noise-cancelling wireless headphones with 30-hour battery life',
    category: 'Electronics',
    price: 349.99,
    quantity: 20,
    unit: 'piece',
    supplier: 'Sony Corporation',
    reorderLevel: 5
  },
  {
    name: 'Desk Lamp - LED',
    description: 'Adjustable LED desk lamp with multiple brightness levels and color temperatures',
    category: 'Office Supplies',
    price: 49.99,
    quantity: 30,
    unit: 'piece',
    supplier: 'Lighting Solutions Inc.',
    reorderLevel: 10
  }
];

const SeedData = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { createInventoryItem } = useContext(InventoryContext);
  
  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSuccess(false);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleSeedData = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Add each sample item to inventory
      for (const item of sampleInventoryItems) {
        await createInventoryItem(item);
      }
      
      setSuccess(true);
      setLoading(false);
      // Close dialog after 2 seconds
      setTimeout(() => {
        setOpen(false);
        window.location.reload(); // Reload page to show new items
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to add sample data');
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Add Sample Inventory Data
      </Button>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Sample Inventory Data</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            This will add 5 sample inventory items to your database. 
            This is useful for testing and demonstration purposes.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Sample data added successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSeedData} 
            color="primary" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Adding...' : 'Add Sample Data'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SeedData; 