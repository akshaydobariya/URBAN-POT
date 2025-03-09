import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Inventory pages
import InventoryList from './pages/inventory/InventoryList';
import AddInventoryItem from './pages/inventory/AddInventoryItem';
import EditInventoryItem from './pages/inventory/EditInventoryItem';
import InventoryItem from './pages/inventory/InventoryItem';

// Sales pages
import SalesList from './pages/sales/SalesList';
import AddSale from './pages/sales/AddSale';
import EditSale from './pages/sales/EditSale';
import Sale from './pages/sales/Sale';

// User pages
import UsersList from './pages/users/UsersList';
import AddUser from './pages/users/AddUser';
import EditUser from './pages/users/EditUser';

// Context
import AuthContext from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { SalesProvider } from './context/SalesContext';

function App() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <>
      <CssBaseline />
      <ToastContainer position="bottom-right" />
      <Box sx={{ display: 'flex' }}>
        {isAuthenticated && <Navbar />}
        {isAuthenticated && <Sidebar />}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: isAuthenticated ? { sm: 30 } : 0,
            width: { sm: `calc(100% - ${isAuthenticated ? 240 : 0}px)` }
          }}
        >
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
            <Route path="/reset-password/:resetToken" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />
            
            {/* Protected Routes */}
            <Route path="/" element={isAuthenticated ? 
              <InventoryProvider>
                <SalesProvider>
                  <Dashboard />
                </SalesProvider>
              </InventoryProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
            
            {/* Inventory Routes */}
            <Route path="/inventory" element={isAuthenticated ? 
              <InventoryProvider>
                <InventoryList />
              </InventoryProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/inventory/add" element={isAuthenticated ? 
              <InventoryProvider>
                <AddInventoryItem />
              </InventoryProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/inventory/:id" element={isAuthenticated ? 
              <InventoryProvider>
                <InventoryItem />
              </InventoryProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/inventory/:id/edit" element={isAuthenticated ? 
              <InventoryProvider>
                <EditInventoryItem />
              </InventoryProvider> : 
              <Navigate to="/login" />} 
            />
            
            {/* Sales Routes */}
            <Route path="/sales" element={isAuthenticated ? 
              <SalesProvider>
                <SalesList />
              </SalesProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/sales/add" element={isAuthenticated ? 
              <SalesProvider>
                <InventoryProvider>
                  <AddSale />
                </InventoryProvider>
              </SalesProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/sales/:id" element={isAuthenticated ? 
              <SalesProvider>
                <Sale />
              </SalesProvider> : 
              <Navigate to="/login" />} 
            />
            <Route path="/sales/:id/edit" element={isAuthenticated ? 
              <SalesProvider>
                <InventoryProvider>
                  <EditSale />
                </InventoryProvider>
              </SalesProvider> : 
              <Navigate to="/login" />} 
            />
            
            {/* User Routes */}
            <Route path="/users" element={isAuthenticated ? <UsersList /> : <Navigate to="/login" />} />
            <Route path="/users/add" element={isAuthenticated ? <AddUser /> : <Navigate to="/login" />} />
            <Route path="/users/:id/edit" element={isAuthenticated ? <EditUser /> : <Navigate to="/login" />} />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App; 