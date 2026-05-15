import React from 'react';
import { useMsal } from '@azure/msal-react';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Card, 
  CardContent,
  Avatar,
  Divider
} from '@mui/material';
import { loginRequest } from '../services/authConfig';
import { 
  Login as LoginIcon,
  Security,
  Cloud,
  Lock
} from '@mui/icons-material';

const Login: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      // Use redirect login only for better authentication persistence
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 450,
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              {/* Logo Section */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 4
              }}>
                <Box
                  component="img"
                  sx={{
                    height: 80,
                    width: 'auto',
                    maxWidth: '90%',
                    objectFit: 'contain',
                    mb: 3,
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                  }}
                  alt="Company Logo"
                  src="/company-logo.png"
                />
                <Typography 
                  component="h1" 
                  variant="h3" 
                  align="center" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 1,
                    fontSize: '2rem'
                  }}
                >
                  IntraDesk
                </Typography>
                <Typography 
                  variant="h6" 
                  align="center" 
                  color="text.secondary"
                  sx={{ 
                    fontWeight: 400,
                    mb: 2
                  }}
                >
                  Internal Knowledge Portal
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Welcome Message */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    mb: 3,
                    color: '#64748b',
                    lineHeight: 1.6
                  }}
                >
                  Welcome to your secure internal portal. Please sign in with your company account to access documents and resources.
                </Typography>
              </Box>

              {/* Features */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#06b6d4', mr: 2, width: 32, height: 32 }}>
                    <Security sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Secure authentication with Microsoft
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

              {/* Login Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                Sign in with Microsoft
              </Button>

              {/* Footer */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Protected by enterprise security standards
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
