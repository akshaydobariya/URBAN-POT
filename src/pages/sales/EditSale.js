import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldArray } from 'formik';
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer'
];

const statuses = [
  'Pending',
  'Completed',
  'Cancelled'
];

const EditSaleSchema = Yup.object().shape({
  customer: Yup.string().required('Customer name is required'),
  paymentMethod: Yup.string().required('Payment method is required'),
  status: Yup.string().required('Status is required'),
  items: Yup.array().of(
    Yup.object().shape({
      product: Yup.object().required('Product is required'),
      quantity: Yup.number()
        .required('Quantity is required')
        .min(1, 'Quantity must be at least 1'),
      price: Yup.number()
        .required('Price is required')
        .min(0, 'Price must be at least 0')
    })
  ).min(1, 'At least one item is required')
});

const EditSale = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sale, setSale] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [saleRes, productsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/sales/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/inventory`)
        ]);
        
        // Transform sale data for form
        const saleData = saleRes.data.data;
        const formattedSale = {
          ...saleData,
          items: saleData.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.price
          }))
        };
        
        setSale(formattedSale);
        setProducts(productsRes.data.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error fetching data');
        navigate('/sales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Calculate subtotals and total
      const items = values.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      }));

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);

      const saleData = {
        customer: values.customer,
        items,
        total,
        paymentMethod: values.paymentMethod,
        status: values.status,
        notes: values.notes
      };

      await axios.put(`${process.env.REACT_APP_API_URL}/sales/${id}`, saleData);
      toast.success('Sale updated successfully');
      navigate(`/sales/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating sale');
    } finally {
      setSubmitting(false);
    }
  };

  // For development, create sample data
  const sampleProducts = [
    { _id: '1', name: 'Laptop', sku: 'LAP001', price: 899.99, quantity: 10 },
    { _id: '2', name: 'Smartphone', sku: 'PHN001', price: 499.99, quantity: 15 },
    { _id: '3', name: 'Headphones', sku: 'AUD001', price: 79.99, quantity: 20 },
    { _id: '4', name: 'Monitor', sku: 'MON001', price: 249.99, quantity: 8 },
    { _id: '5', name: 'Keyboard', sku: 'KEY001', price: 49.99, quantity: 25 }
  ];

  const sampleSale = {
    customer: 'John Doe',
    paymentMethod: 'Credit Card',
    status: 'Completed',
    notes: 'Sample sale',
    items: [
      {
        product: sampleProducts[0],
        quantity: 1,
        price: 899.99
      },
      {
        product: sampleProducts[2],
        quantity: 2,
        price: 79.99
      }
    ]
  };

  // Use sample data if no data is fetched
  const displayProducts = products.length > 0 ? products : sampleProducts;
  const initialValues = sale || sampleSale;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Sale
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <Formik
          initialValues={initialValues}
          validationSchema={EditSaleSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Customer Name"
                    name="customer"
                    error={touched.customer && Boolean(errors.customer)}
                    helperText={touched.customer && errors.customer}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="Payment Method"
                    name="paymentMethod"
                    error={touched.paymentMethod && Boolean(errors.paymentMethod)}
                    helperText={touched.paymentMethod && errors.paymentMethod}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    error={touched.status && Boolean(errors.status)}
                    helperText={touched.status && errors.status}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Sale Items
                  </Typography>
                  
                  <FieldArray name="items">
                    {({ push, remove }) => (
                      <>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                                <TableCell align="center">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {values.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell style={{ minWidth: 250 }}>
                                    <Autocomplete
                                      options={displayProducts}
                                      getOptionLabel={(option) => option.name || ''}
                                      value={item.product}
                                      onChange={(e, value) => {
                                        setFieldValue(`items.${index}.product`, value);
                                        if (value) {
                                          setFieldValue(`items.${index}.price`, value.price);
                                        }
                                      }}
                                      renderInput={(params) => (
                                        <TextField
                                          {...params}
                                          label="Product"
                                          error={
                                            touched.items?.[index]?.product && 
                                            Boolean(errors.items?.[index]?.product)
                                          }
                                          helperText={
                                            touched.items?.[index]?.product && 
                                            errors.items?.[index]?.product
                                          }
                                        />
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Field
                                      as={TextField}
                                      name={`items.${index}.price`}
                                      type="number"
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        inputProps: { min: 0, step: 0.01 }
                                      }}
                                      error={
                                        touched.items?.[index]?.price && 
                                        Boolean(errors.items?.[index]?.price)
                                      }
                                      helperText={
                                        touched.items?.[index]?.price && 
                                        errors.items?.[index]?.price
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Field
                                      as={TextField}
                                      name={`items.${index}.quantity`}
                                      type="number"
                                      InputProps={{ inputProps: { min: 1 } }}
                                      error={
                                        touched.items?.[index]?.quantity && 
                                        Boolean(errors.items?.[index]?.quantity)
                                      }
                                      helperText={
                                        touched.items?.[index]?.quantity && 
                                        errors.items?.[index]?.quantity
                                      }
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell align="center">
                                    <IconButton
                                      color="error"
                                      onClick={() => remove(index)}
                                      disabled={values.items.length === 1}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        
                        <Button
                          type="button"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => push({ product: null, quantity: 1, price: 0 })}
                          sx={{ mb: 3 }}
                        >
                          Add Item
                        </Button>
                      </>
                    )}
                  </FieldArray>
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Total: {values.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0).toLocaleString('en-IN')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate(`/sales/${id}`)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Update Sale'}
                      </Button>
                    </Box>
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

export default EditSale; 