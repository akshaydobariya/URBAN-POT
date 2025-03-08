import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';

const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { token } = useContext(AuthContext);

  // Update API configuration whenever token changes
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Set auth token for API calls
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Get all sales with pagination
  const getSales = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      
      let url = `/sales?page=${page}&limit=${limit}`;
      
      // Add filters to URL if they exist
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      
      const res = await api.get(url);
      setSales(res.data.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching sales');
      toast.error(err.response?.data?.message || 'Error fetching sales');
      setLoading(false);
      throw err;
    }
  };

  // Get single sale
  const getSale = async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/sales/${id}`);
      setSale(res.data.data);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching sale');
      toast.error(err.response?.data?.message || 'Error fetching sale');
      setLoading(false);
      throw err;
    }
  };

  // Create sale
  const createSale = async (saleData) => {
    try {
      const res = await api.post('/sales', saleData);
      setSales([...sales, res.data.data]);
      toast.success('Sale created successfully');
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating sale');
      toast.error(err.response?.data?.message || 'Error creating sale');
      throw err;
    }
  };

  // Update sale
  const updateSale = async (id, saleData) => {
    try {
      const res = await api.put(`/sales/${id}`, saleData);
      setSales(sales.map(s => s._id === id ? res.data.data : s));
      setSale(res.data.data);
      toast.success('Sale updated successfully');
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating sale');
      toast.error(err.response?.data?.message || 'Error updating sale');
      throw err;
    }
  };

  // Delete sale
  const deleteSale = async (id) => {
    try {
      await api.delete(`/sales/${id}`);
      setSales(sales.filter(s => s._id !== id));
      toast.success('Sale deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting sale');
      toast.error(err.response?.data?.message || 'Error deleting sale');
      throw err;
    }
  };

  // Get sales statistics
  const getSalesStats = async (period = 'month') => {
    try {
      setLoading(true);
      const res = await api.get(`/sales/stats?period=${period}`);
      setLoading(false);
      return res.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching sales statistics');
      toast.error(err.response?.data?.message || 'Error fetching sales statistics');
      setLoading(false);
      throw err;
    }
  };

  return (
    <SalesContext.Provider
      value={{
        sales,
        sale,
        loading,
        error,
        getSales,
        getSale,
        createSale,
        updateSale,
        deleteSale,
        getSalesStats
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export default SalesContext; 