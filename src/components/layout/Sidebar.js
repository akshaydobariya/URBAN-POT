import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  People as PeopleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import AuthContext from '../../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const isAdmin = user && user.role === 'admin';
  
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      showAlways: true
    },
    {
      text: 'Inventory',
      icon: <InventoryIcon />,
      path: '/inventory',
      showAlways: true
    },
    {
      text: 'Sales',
      icon: <SalesIcon />,
      path: '/sales',
      showAlways: true
    },
    {
      text: 'Users',
      icon: <PeopleIcon />,
      path: '/users',
      showAdmin: true
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      showAlways: true
    }
  ];
  
  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {menuItems.map((item) => {
          // Only show admin items to admins
          if (item.showAdmin && !isAdmin) return null;
          // Show items marked as showAlways to everyone
          if (item.showAlways || isAdmin) {
            return (
              <ListItem 
                button 
                key={item.text} 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'primary.main',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? 'white' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            );
          }
          return null;
        })}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth 
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar; 