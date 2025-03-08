import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState([]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AuthContext);

  // Create API instance with proper headers
  const api = axios.create({
    // Make sure this matches your server URL
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });

  // Set auth token for API calls
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Get all inventory items with cache busting
  const getInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      console.log('Fetching inventory with token:', token ? 'Token exists' : 'No token');
      
      // Make sure this URL matches your server route
      const res = await api.get(`/inventory?_=${timestamp}`);
      
      console.log('Inventory API response:', res);
      console.log('Inventory data:', res.data);
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        console.log('Setting inventory with data array:', res.data.data);
        setInventory(res.data.data);
      } else if (res.data && Array.isArray(res.data)) {
        console.log('Setting inventory with direct array:', res.data);
        setInventory(res.data);
      } else {
        console.error('Invalid inventory data format:', res.data);
        setInventory([]);
        toast.error('Error loading inventory data: Invalid format');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.response?.data?.message || 'Error fetching inventory');
      toast.error(err.response?.data?.message || 'Error fetching inventory');
      setInventory([]);
      setLoading(false);
    }
  };

  // Get single inventory item
  const getInventoryItem = async (id) => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const res = await api.get(`/inventory/${id}?_=${timestamp}`);
      setItem(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching inventory item');
      toast.error(err.response?.data?.message || 'Error fetching inventory item');
      setLoading(false);
      throw err;
    }
  };

  // Create inventory item
  const createInventoryItem = async (itemData) => {
    try {
      // Ensure all numeric fields are numbers, not strings
      const processedData = {
        ...itemData,
        quantity: Number(itemData.quantity),
        price: Number(itemData.price),
        cost: Number(itemData.cost),
        reorderLevel: Number(itemData.reorderLevel),
        minStockLevel: Number(itemData.reorderLevel)
      };
      
      console.log('Creating inventory item with data:', processedData);
      
      const res = await api.post('/inventory', processedData);
      setInventory([...inventory, res.data.data]);
      toast.success('Inventory item created successfully');
      return res.data.data;
    } catch (err) {
      console.error('Error creating inventory item:', err.response?.data || err);
      setError(err.response?.data?.message || 'Error creating inventory item');
      toast.error(err.response?.data?.message || 'Error creating inventory item');
      throw err;
    }
  };

  // Update inventory item
  const updateInventoryItem = async (id, itemData) => {
    try {
      const res = await api.put(`/inventory/${id}`, itemData);
      setInventory(inventory.map(i => i._id === id ? res.data.data : i));
      setItem(res.data.data);
      toast.success('Inventory item updated successfully');
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating inventory item');
      toast.error(err.response?.data?.message || 'Error updating inventory item');
      throw err;
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setInventory(inventory.filter(i => i._id !== id));
      toast.success('Inventory item deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting inventory item');
      toast.error(err.response?.data?.message || 'Error deleting inventory item');
      throw err;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        item,
        loading,
        error,
        getInventory,
        getInventoryItem,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext; 