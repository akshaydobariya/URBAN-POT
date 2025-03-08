import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import AuthContext from '../../context/AuthContext';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
});

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await forgotPassword(values.email);
      setSuccess(true);
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Forgot Password
          </Typography>
          
          {success ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="success">
                Password reset email sent! Please check your inbox.
              </Alert>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link to="/login">Back to Login</Link>
              </Box>
            </Box>
          ) : (
            <>
              <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              
              <Formik
                initialValues={{ email: '' }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      margin="normal"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ mt: 3, mb: 2 }}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
                    </Button>
                  </Form>
                )}
              </Formik>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2">
                  <Link to="/login">Back to Login</Link>
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 