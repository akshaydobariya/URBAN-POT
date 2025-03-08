import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';

// Layout components
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Main pages
import Dashboard from '../../pages/Dashboard';
import Profile from '../../pages/Profile';

// Inventory pages
import InventoryList from '../../pages/inventory/InventoryList';
import AddInventoryItem from '../../pages/inventory/AddInventoryItem';
import EditInventoryItem from '../../pages/inventory/EditInventoryItem';
import InventoryItem from '../../pages/inventory/InventoryItem';

// Sales pages
import SalesList from '../../pages/sales/SalesList';
import AddSale from '../../pages/sales/AddSale';
import EditSale from '../../pages/sales/EditSale';
import Sale from '../../pages/sales/Sale';

// User pages
import UsersList from '../../pages/users/UsersList';
import AddUser from '../../pages/users/AddUser';
import EditUser from '../../pages/users/EditUser';

// Context
import AuthContext from '../../context/AuthContext';

const Layout = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If still loading, you can show a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Sidebar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { sm: 30 },
          width: { sm: `calc(100% - 240px)` }
        }}
      >
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Inventory Routes */}
          <Route path="/inventory" element={<InventoryList />} />
          <Route path="/inventory/add" element={<AddInventoryItem />} />
          <Route path="/inventory/:id" element={<InventoryItem />} />
          <Route path="/inventory/:id/edit" element={<EditInventoryItem />} />
          
          {/* Sales Routes */}
          <Route path="/sales" element={<SalesList />} />
          <Route path="/sales/add" element={<AddSale />} />
          <Route path="/sales/:id" element={<Sale />} />
          <Route path="/sales/:id/edit" element={<EditSale />} />
          
          {/* User Routes */}
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="/users/:id/edit" element={<EditUser />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Layout; 