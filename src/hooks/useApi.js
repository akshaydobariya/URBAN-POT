import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from '../context/AuthContext';

export const useApi = (endpoint, initialParams = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const { token } = useContext(AuthContext);
  
  // Set up axios config with token
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  };

  const fetchData = useCallback(async (queryParams = params) => {
    try {
      setLoading(true);
      
      // Build query string
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');
      
      console.log(`Fetching from ${endpoint}?${queryString}`);
      
      const response = await axios.get(`${endpoint}?${queryString}`, config);
      
      if (response.data.success) {
        setData(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } else {
        setError(response.data.error || 'Failed to load data');
        toast.error(response.data.error || 'Failed to load data');
      }
      
      return response.data;
    } catch (err) {
      console.error(`Error fetching from ${endpoint}:`, err);
      setError(err.response?.data?.error || 'Failed to load data');
      toast.error(err.response?.data?.error || 'Failed to load data');
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, config]);

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [fetchData, token]);

  // Update params and refetch
  const updateParams = useCallback((newParams) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      fetchData(updated);
      return updated;
    });
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    pagination,
    params,
    fetchData,
    updateParams
  };
}; 