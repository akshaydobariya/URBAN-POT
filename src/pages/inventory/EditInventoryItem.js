import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Chip
} from '@mui/material';
import { toast } from 'react-toastify';

const categories = [
  'Electronics',
  'Clothing',
  'Food',
  'Furniture',
  'Books',
  'Other'
];

const EditInventorySchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  sku: Yup.string().required('SKU is required'),
  category: Yup.string().required('Category is required'),
  description: Yup.string(),
  quantity: Yup.number()
    .required('Quantity is required')
    .min(0, 'Quantity must be at least 0'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price must be at least 0'),
  cost: Yup.number()
    .required('Cost is required')
    .min(0, 'Cost must be at least 0'),
  minimumStockLevel: Yup.number()
    .required('Minimum stock level is required')
    .min(0, 'Minimum stock level must be at least 0')
});

const EditInventoryItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/inventory/${id}`);
        setItem(res.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching item details');
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/inventory/${id}`, values);
      toast.success('Inventory item updated successfully');
      navigate(`/inventory/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Sample item for development
  const sampleItem = {
    name: 'Sample Product',
    sku: 'SKU001',
    category: 'Electronics',
    description: 'This is a sample product description.',
    quantity: 100,
    price: 19.99,
    cost: 10.99,
    minimumStockLevel: 10
  };

  // Use sample data if no item is fetched
  const initialValues = item || sampleItem;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Inventory Item
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={EditInventorySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Name"
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="SKU"
                    name="sku"
                    error={touched.sku && Boolean(errors.sku)}
                    helperText={touched.sku && errors.sku}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="Category"
                    name="category"
                    error={touched.category && Boolean(errors.category)}
                    helperText={touched.category && errors.category}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    error={touched.quantity && Boolean(errors.quantity)}
                    helperText={touched.quantity && errors.quantity}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    error={touched.price && Boolean(errors.price)}
                    helperText={touched.price && errors.price}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Cost"
                    name="cost"
                    type="number"
                    error={touched.cost && Boolean(errors.cost)}
                    helperText={touched.cost && errors.cost}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Minimum Stock Level"
                    name="minimumStockLevel"
                    type="number"
                    error={touched.minimumStockLevel && Boolean(errors.minimumStockLevel)}
                    helperText={touched.minimumStockLevel && errors.minimumStockLevel}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/inventory/${id}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Update Item'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default EditInventoryItem; 