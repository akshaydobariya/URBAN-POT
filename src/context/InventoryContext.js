import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

// Initial state
const initialState = {
  inventory: [],
  loading: true,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    search: '',
    category: '',
    sort: '-createdAt'
  },
  currentItem: null
};

// Create context
const InventoryContext = createContext(initialState);

// Reducer
const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'GET_INVENTORY_REQUEST':
      return {
        ...state,
        loading: true
      };
    case 'GET_INVENTORY_SUCCESS':
      return {
        ...state,
        loading: false,
        inventory: action.payload.data,
        pagination: action.payload.pagination,
        error: null
      };
    case 'GET_INVENTORY_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'GET_INVENTORY_ITEM_SUCCESS':
      return {
        ...state,
        loading: false,
        currentItem: action.payload,
        error: null
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1 // Reset to page 1 when filters change
        }
      };
    case 'SET_PAGE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page: action.payload
        }
      };
    case 'CLEAR_CURRENT_ITEM':
      return {
        ...state,
        currentItem: null
      };
    case 'ADD_INVENTORY_ITEM':
      return {
        ...state,
        inventory: [action.payload, ...state.inventory],
        loading: false
      };
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item => 
          item._id === action.payload._id ? action.payload : item
        ),
        currentItem: action.payload,
        loading: false
      };
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item._id !== action.payload),
        loading: false
      };
    default:
      return state;
  }
};

// Provider component
export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { token } = useContext(AuthContext);
  
  // Set up axios config with token
  const config = useMemo(() => ({
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  }), [token]);

  // Get all inventory items
  const getInventory = useCallback(async () => {
    try {
      dispatch({ type: 'GET_INVENTORY_REQUEST' });
      
      // Build query string - safely access state properties
      const page = state.pagination?.page || 1;
      const limit = state.pagination?.limit || 10;
      const search = state.filters?.search || '';
      const category = state.filters?.category || '';
      const sort = state.filters?.sort || '-createdAt';
      
      let queryParams = `page=${page}&limit=${limit}`;
      
      if (sort) {
        queryParams += `&sort=${sort}`;
      }
      
      if (search) {
        queryParams += `&search=${search}`;
      }
      
      if (category) {
        queryParams += `&category=${category}`;
      }
      
      console.log(`Fetching inventory with params: ${queryParams}`);
      
      const res = await axios.get(`/api/inventory?${queryParams}`, config);
      
      dispatch({
        type: 'GET_INVENTORY_SUCCESS',
        payload: res.data
      });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      
      dispatch({
        type: 'GET_INVENTORY_ERROR',
        payload: err.response?.data?.error || 'Failed to load inventory items'
      });
      
      toast.error(err.response?.data?.error || 'Failed to load inventory items');
    }
  }, [state.pagination, state.filters, config]);

  // Get single inventory item
  const getInventoryItem = useCallback(async (id) => {
    try {
      dispatch({ type: 'GET_INVENTORY_REQUEST' });
      
      const res = await axios.get(`/api/inventory/${id}`, config);
      
      dispatch({
        type: 'GET_INVENTORY_ITEM_SUCCESS',
        payload: res.data.data
      });
      
      return res.data.data;
    } catch (err) {
      console.error('Error fetching inventory item:', err);
      
      dispatch({
        type: 'GET_INVENTORY_ERROR',
        payload: err.response?.data?.error || 'Failed to load inventory item'
      });
      
      toast.error(err.response?.data?.error || 'Failed to load inventory item');
      return null;
    }
  }, [config]);

  // Add inventory item
  const addInventoryItem = useCallback(async (itemData) => {
    try {
      dispatch({ type: 'GET_INVENTORY_REQUEST' });
      
      const res = await axios.post('/api/inventory', itemData, config);
      
      dispatch({
        type: 'ADD_INVENTORY_ITEM',
        payload: res.data.data
      });
      
      toast.success('Inventory item added successfully');
      return res.data.data;
    } catch (err) {
      console.error('Error adding inventory item:', err);
      
      dispatch({
        type: 'GET_INVENTORY_ERROR',
        payload: err.response?.data?.error || 'Failed to add inventory item'
      });
      
      toast.error(err.response?.data?.error || 'Failed to add inventory item');
      return null;
    }
  }, [config]);

  // Update inventory item
  const updateInventoryItem = useCallback(async (id, itemData) => {
    try {
      dispatch({ type: 'GET_INVENTORY_REQUEST' });
      
      const res = await axios.put(`/api/inventory/${id}`, itemData, config);
      
      dispatch({
        type: 'UPDATE_INVENTORY_ITEM',
        payload: res.data.data
      });
      
      toast.success('Inventory item updated successfully');
      return res.data.data;
    } catch (err) {
      console.error('Error updating inventory item:', err);
      
      dispatch({
        type: 'GET_INVENTORY_ERROR',
        payload: err.response?.data?.error || 'Failed to update inventory item'
      });
      
      toast.error(err.response?.data?.error || 'Failed to update inventory item');
      return null;
    }
  }, [config]);

  // Delete inventory item
  const deleteInventoryItem = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/inventory/${id}`, config);
        
        dispatch({
          type: 'DELETE_INVENTORY_ITEM',
          payload: id
        });
        
        toast.success('Inventory item deleted successfully');
        return true;
      } catch (err) {
        console.error('Error deleting inventory item:', err);
        
        toast.error(err.response?.data?.error || 'Failed to delete inventory item');
        return false;
      }
    }
    return false;
  }, [config]);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters
    });
  }, []);

  // Set page
  const setPage = useCallback((page) => {
    dispatch({
      type: 'SET_PAGE',
      payload: page
    });
  }, []);

  // Clear current item
  const clearCurrentItem = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_ITEM' });
  }, []);

  // Fetch inventory when pagination or filters change
  useEffect(() => {
    if (token) {
      getInventory();
    }
  }, [token, getInventory]);

  return (
    <InventoryContext.Provider
      value={{
        inventory: state.inventory,
        loading: state.loading,
        error: state.error,
        pagination: state.pagination,
        filters: state.filters,
        currentItem: state.currentItem,
        getInventory,
        getInventoryItem,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        setFilters,
        setPage,
        clearCurrentItem
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use the inventory context
export const useInventory = () => {
  const context = useContext(InventoryContext);
  
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  
  return context;
};

// Export the context as default for backward compatibility
export default InventoryContext; 