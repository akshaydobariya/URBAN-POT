import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

const UsersList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Check if user is admin
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('You do not have permission to access this page');
      return;
    }
    
    fetchUsers();
  }, [page, pageSize, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let url = `/api/users?page=${page + 1}&limit=${pageSize}`;
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const res = await axios.get(url);
      
      setUsers(res.data.data);
      setTotalItems(res.data.total);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
    setTimeout(() => {
      fetchUsers();
    }, 0);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/users/${userToDelete._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || 
        'Failed to delete user'
      );
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Helper function to get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'staff':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
      minWidth: 200
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)} 
          color={getRoleColor(params.value)} 
          size="small" 
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 180,
      valueFormatter: (params) => format(new Date(params.value), 'MMM dd, yyyy')
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => navigate(`/users/${params.row._id}`)}
            size="small"
          >
            <VisibilityIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => navigate(`/users/${params.row._id}/edit`)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          {/* Don't allow deleting yourself */}
          {params.row._id !== user._id && (
            <IconButton
              color="error"
              onClick={() => handleDeleteClick(params.row)}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/users/add"
        >
          Add User
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchTerm && (
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClearSearch}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton
                    aria-label="search"
                    onClick={handleSearch}
                    edge="end"
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Paper>
      
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          pagination
          pageSize={pageSize}
          rowsPerPageOptions={[5, 10, 25, 50]}
          rowCount={totalItems}
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row._id}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersList; 