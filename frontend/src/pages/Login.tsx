import React from 'react';
import { useMsal } from '@azure/msal-react';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Grid
} from '@mui/material';
import { loginRequest } from '../services/authConfig';
import { Login as LoginIcon } from '@mui/icons-material';

const Login: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        // Modern abstract wave background using CSS blobs
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(142,45,226,0.05) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: 0
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '60%',
          height: '70%',
          background: 'radial-gradient(circle, rgba(74,0,224,0.05) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          zIndex: 0
        }
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          width: '90%',
          maxWidth: 1000,
          minHeight: 600,
          borderRadius: 4,
          overflow: 'hidden',
          zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <Grid container sx={{ flex: 1 }}>
          
          {/* Left Side - Illustration (Hidden on mobile) */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              p: 4
            }}
          >
            <Box
              component="img"
              src="/login-illustration.png"
              alt="Workspace Illustration"
              sx={{
                width: '100%',
                maxWidth: 400,
                objectFit: 'contain'
              }}
            />
          </Grid>

          {/* Right Side - Login Panel */}
          <Grid 
            item 
            xs={12} 
            md={6} 
            sx={{ 
              background: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 4, sm: 6 },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Soft background accents for the right panel */}
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)'
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -100,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)'
            }} />

            {/* Logo */}
            <Box
              component="img"
              src="/company-logo.png"
              alt="Company Logo"
              sx={{
                height: 80,
                width: 'auto',
                maxWidth: '90%',
                objectFit: 'contain',
                mb: 2,
                filter: 'brightness(0) invert(1) drop-shadow(0 4px 6px rgba(0,0,0,0.2))', // Makes logo white and pops it
                position: 'relative',
                zIndex: 2
              }}
            />
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                mb: 1, 
                position: 'relative', 
                zIndex: 2,
                letterSpacing: 1
              }}
            >
              IntraDesk
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 5, 
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                position: 'relative', 
                zIndex: 2,
                maxWidth: 300
              }}
            >
              Secure internal knowledge portal for company documents and SOPs.
            </Typography>

            {/* Vibrant Yellow Login Button */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                color: '#4a00e0', // Dark purple text for high contrast on yellow
                backgroundColor: '#FFD166', // Vibrant yellow from mockup
                boxShadow: '0 8px 20px rgba(255, 209, 102, 0.4)',
                position: 'relative',
                zIndex: 2,
                maxWidth: 350,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#ffc13b',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 25px rgba(255, 209, 102, 0.5)',
                }
              }}
            >
              Sign in with Microsoft
            </Button>
            
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 4, 
                color: 'rgba(255,255,255,0.5)',
                position: 'relative',
                zIndex: 2
              }}
            >
              Enterprise Security Protected
            </Typography>

          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;
