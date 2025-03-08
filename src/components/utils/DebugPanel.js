import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Divider } from '@mui/material';
import axios from 'axios';

const DebugPanel = () => {
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testInventoryApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Make direct API call to inventory endpoint
      const res = await axios.get('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      setApiResponse(res.data);
      console.log('Direct API response:', res.data);
    } catch (err) {
      setError(err.response?.data || err.message);
      console.error('Error testing API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Debug Panel</Typography>
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={testInventoryApi}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Inventory API'}
      </Button>
      
      {error && (
        <Box sx={{ mt: 2 }}>
          <Typography color="error" variant="subtitle2">Error:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </Box>
      )}
      
      {apiResponse && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">API Response:</Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2">
            Success: {apiResponse.success ? 'Yes' : 'No'}
          </Typography>
          {apiResponse.count !== undefined && (
            <Typography variant="body2">
              Count: {apiResponse.count}
            </Typography>
          )}
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2">Data:</Typography>
          <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default DebugPanel; 