import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box
} from '@mui/material';
import { 
  Description, 
  LibraryBooks, 
  Article, 
  Help,
  TrendingUp
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    count: number;
  }>>([
    {
      title: 'Policies',
      description: 'Company policies',
      icon: <Description />,
      count: 0
    },
    {
      title: 'SOPs',
      description: 'Standard Operating Procedures',
      icon: <LibraryBooks />,
      count: 0
    },
    {
      title: 'Templates',
      description: 'Document templates and forms',
      icon: <Article />,
      count: 0
    },
    {
      title: 'FAQs',
      description: 'Frequently Asked Questions',
      icon: <Help />,
      count: 0
    },
  ]);

  // Fetch real statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/documents/stats/overview');
        const stats = response.data;
        setCategories(prevCategories => 
          prevCategories.map((cat: any, index: number) => ({
            ...cat,
            count: stats[cat.title.toLowerCase()] || 0
          }))
        );
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, background: 'var(--snow-white)' }}>
      
      {/* Statistics Overview */}
      <Card 
        sx={{ 
          mb: 4, 
          background: 'var(--ice-blue)',
          boxShadow: '0 10px 30px rgba(55,138,221,0.15)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ color: 'var(--text-primary)', position: 'relative', zIndex: 1, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: 'var(--mint)',
              backdropFilter: 'blur(10px)'
            }}>
              <TrendingUp sx={{ fontSize: 48, color: 'var(--trend-blue)' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.9, color: 'var(--label-blue)' }}>
                Total Documents
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 1, color: 'var(--number-blue)' }}>
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <Grid container spacing={3}>
        {categories.map((category: any, index: number) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '0.5px solid var(--card-border)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'var(--text-secondary)'
                }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    background: 'var(--btn-primary-bg)',
                    color: 'var(--btn-primary-text)',
                    mr: 2
                  }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {category.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'var(--text-secondary)' }}>
                  {category.description}
                </Typography>
                <Typography variant="h4" sx={{ mb: 2, color: 'var(--number-blue)' }}>
                  {category.count}
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate(`/documents/${category.title.toLowerCase()}`)}
                  sx={{ 
                    background: 'var(--btn-primary-bg)',
                    color: 'var(--btn-primary-text)',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: `0 4px 12px var(--btn-primary-bg)30`,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      background: 'var(--btn-primary-hover)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px var(--btn-primary-bg)40',
                    }
                  }}
                >
                  View Documents
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
