import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Summary
            </Typography>
            <Typography variant="body1">
              Total Items: 0
            </Typography>
            <Typography variant="body1">
              Low Stock Items: 0
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" gutterBottom>
              Sales Summary
            </Typography>
            <Typography variant="body1">
              Total Sales: 0
            </Typography>
            <Typography variant="body1">
              Monthly Revenue: $0
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Typography variant="h6" gutterBottom>
              User Summary
            </Typography>
            <Typography variant="body1">
              Total Users: 0
            </Typography>
            <Typography variant="body1">
              Active Users: 0
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 