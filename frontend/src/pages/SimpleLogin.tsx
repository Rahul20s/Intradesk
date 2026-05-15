import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Avatar
} from '@mui/material';
import { 
  Login as LoginIcon,
  Security,
  Cloud,
  Lock
} from '@mui/icons-material';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

const SimpleLogin: React.FC = () => {
  const { instance } = useMsal();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      await instance.loginPopup(loginRequest);
      navigate('/dashboard');
    } catch (e: any) {
      console.error(e);
      // MSAL errors usually have an errorCode or message property
      const errorMessage = e?.errorMessage || e?.message || 'Login failed. Please try again.';
      setError(`Login Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {/* Left Side - Company Branding */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          background: 'var(--page-bg)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Company Logo */}
        <Box
          component="img"
          sx={{
            height: 120,
            width: 'auto',
            maxWidth: '80%',
            objectFit: 'contain',
            mb: 4,
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2))',
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
            }
          }}
          alt="Company Logo"
          src="/company-logo.png"
        />
        
        {/* Company Name */}
        <Typography 
          variant="h2" 
          component="h1"
          sx={{ 
            fontWeight: 800,
            color: 'var(--text-secondary)',
            mb: 2,
            fontSize: '3rem',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            letterSpacing: '1px'
          }}
        >
          IntraDesk
        </Typography>
        
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'var(--text-secondary)',
            fontWeight: 300,
            mb: 6,
            fontSize: '1.5rem'
          }}
        >
          Internal Knowledge Portal
        </Typography>

        {/* Decorative Elements */}
        <Box sx={{ position: 'absolute', bottom: 40, textAlign: 'center' }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            Secure • Reliable • Professional
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: '50%',
          height: '100%',
          background: 'var(--page-bg)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ width: '100%', maxWidth: 450, p: 4 }}>
            {/* Welcome Message */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  mb: 2,
                  fontSize: '1.8rem'
                }}
              >
                Welcome Back
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}
              >
                Sign in to access your internal portal
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={handleLogin}
                fullWidth
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{ 
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  boxShadow: '0 4px 12px var(--btn-primary-bg)30',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'var(--btn-primary-hover)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px var(--btn-primary-bg)40',
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In with Microsoft'}
              </Button>
            </Box>

            {/* Features */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#06b6d4', mr: 2, width: 32, height: 32 }}>
                  <Security sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Secure Azure AD authentication
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2, width: 32, height: 32 }}>
                  <Cloud sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Access to company documents & resources
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#f59e0b', mr: 2, width: 32, height: 32 }}>
                  <Lock sx={{ fontSize: 18 }} />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  Enterprise-grade security
                </Typography>
              </Box>
            </Box>

            {/* Footer */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Protected by enterprise security standards
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SimpleLogin;
