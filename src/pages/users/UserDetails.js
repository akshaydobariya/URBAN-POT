import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import AuthContext from '../../context/AuthContext';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser && currentUser.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast.error('You do not have permission to access this page');
      return;
    }
    
    fetchUser();
  }, [id, isAdmin, navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/${id}`);
      setUser(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Failed to load user'
      );
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success('User deleted successfully');
      navigate('/users');
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
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/users')}
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </Box>
      </Container>
    );
  }

  if (!user) return null;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mb: 2 }}
        >
          Back to Users
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          User Details
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.name}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {user.email}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Role
            </Typography>
            <Chip 
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
              color={
                user.role === 'admin' 
                  ? 'error' 
                  : user.role === 'manager' 
                    ? 'warning' 
                    : 'info'
              }
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Created At
            </Typography>
            <Typography variant="body1" gutterBottom>
              {format(new Date(user.createdAt), 'PPP')}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/users/${id}/edit`)}
        >
          Edit
        </Button>
        
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteClick}
        >
          Delete
        </Button>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user "{user.name}"? This action cannot be undone.
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

export default UserDetails; 