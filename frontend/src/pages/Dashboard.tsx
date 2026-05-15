import React, { useState, useEffect, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Card, CardContent, Typography, Box, Divider, Button, LinearProgress, TextField
} from '@mui/material';
import { 
  Description, LibraryBooks, Article, Help, Group, CheckCircleOutline, UploadFile, Add, Search, Assessment, Business, AccountBalance
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useMsal();
  const userName = accounts.length > 0 && accounts[0].name ? accounts[0].name.split(' ')[0] : 'Admin';

  const [stats, setStats] = useState({
    total: 0,
    policies: 0,
    sops: 0,
    templates: 0,
    faqs: 0
  });

  const [recentDocs, setRecentDocs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          api.get('/documents/stats/overview'),
          api.get('/documents?limit=50')
        ]);
        setStats(statsRes.data);
        setRecentDocs(docsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  // Calculate department percentages based on recent docs
  const departmentStats = useMemo(() => {
    if (recentDocs.length === 0) return [];
    
    const counts: Record<string, number> = {};
    recentDocs.forEach(doc => {
      counts[doc.department] = (counts[doc.department] || 0) + 1;
    });

    const total = recentDocs.length;
    const colors = ['teal', 'blue', 'amber', 'red', 'purple'];
    
    return Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        code: name.substring(0, 3).toUpperCase(),
        percent: Math.round((count / total) * 100),
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 4); // Top 4 departments
  }, [recentDocs]);

  const latestUpdates = recentDocs.slice(0, 5);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>
            Welcome, {userName} 👋
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {currentDate} · Here's what's happening at CFMARC
          </Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 350 } }}>
          <TextField
            fullWidth
            placeholder="Search all documents..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'var(--text-secondary)', fontSize: 20 }} />,
              sx: { 
                borderRadius: 2, 
                backgroundColor: 'var(--input-bg)',
                '& fieldset': { borderColor: 'var(--input-border)' },
                '&:hover fieldset': { borderColor: 'var(--input-focus-border) !important' },
                '&.Mui-focused fieldset': { borderColor: 'var(--input-focus-border) !important' },
                color: 'var(--text-primary)',
                fontSize: '0.875rem'
              }
            }}
          />
        </Box>
      </Box>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<UploadFile />} onClick={() => navigate('/admin')} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--icon-text-teal)', background: 'var(--icon-bg-teal)' } }}>
            Upload Doc
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Add />} onClick={() => navigate('/admin')} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--icon-text-teal)', background: 'var(--icon-bg-teal)' } }}>
            Add FAQ
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Search />} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--icon-text-teal)', background: 'var(--icon-bg-teal)' } }}>
            Search Docs
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Assessment />} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1, borderRadius: 2, textTransform: 'none', '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--icon-text-teal)', background: 'var(--icon-bg-teal)' } }}>
            View Report
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column: 2x2 Stats & Department/Category */}
        <Grid item xs={12} md={7}>
          {/* 2x2 Grid for Stat Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-teal)', color: 'var(--icon-text-teal)', mb: 1.5 }}>
                      <Article fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>Total Documents</Typography>
                    <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>{stats.total}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-blue)', color: 'var(--icon-text-blue)', mb: 1.5 }}>
                      <Business fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>Company Policies</Typography>
                    <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>{stats.policies}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-amber)', color: 'var(--icon-text-amber)', mb: 1.5 }}>
                      <LibraryBooks fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>SOPs Available</Typography>
                    <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>{stats.sops}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-red)', color: 'var(--icon-text-red)', mb: 1.5 }}>
                      <Help fontSize="small" />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>FAQs</Typography>
                    <Typography variant="h5" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>{stats.faqs}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Department Activity */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>Department Focus</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-teal)', cursor: 'pointer' }}>Based on recent docs</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {departmentStats.length > 0 ? departmentStats.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                        {item.code}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '40%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.percent} 
                        sx={{ 
                          flexGrow: 1, height: 4, borderRadius: 2, backgroundColor: 'var(--input-border)',
                          '& .MuiLinearProgress-bar': { backgroundColor: `var(--icon-text-${item.color})` }
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: `var(--icon-text-${item.color})`, width: 30, textAlign: 'right' }}>{item.percent}%</Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', py: 2, textAlign: 'center' }}>No recent department activity</Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Docs by Category */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 2 }}>Docs by Category</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'SOPs', count: stats.sops, color: 'var(--icon-text-teal)' },
                  { label: 'FAQs', count: stats.faqs, color: 'var(--icon-text-blue)' },
                  { label: 'Policies', count: stats.policies, color: 'var(--text-muted)' },
                  { label: 'Templates', count: stats.templates, color: 'var(--text-muted)' }
                ].map((item, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{item.label}</Typography>
                      <Typography variant="caption" sx={{ color: item.color }}>{item.count} doc{item.count !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.total === 0 ? 0 : (item.count / Math.max(stats.total, 1)) * 100} 
                      sx={{ height: 4, borderRadius: 2, backgroundColor: 'var(--input-border)', '& .MuiLinearProgress-bar': { backgroundColor: item.color } }} 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Latest Updates & Announcements */}
        <Grid item xs={12} md={5}>
          {/* Latest Updates */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, height: '100%', mb: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>Latest Updates</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-teal)', cursor: 'pointer' }} onClick={() => navigate('/documents/default')}>View all</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {latestUpdates.length > 0 ? latestUpdates.map((doc, i) => {
                  const isFaq = doc.category === 'FAQS';
                  const color = isFaq ? 'amber' : (doc.category === 'POLICIES' ? 'blue' : 'teal');
                  const icon = isFaq ? <Help fontSize="small" /> : (doc.category === 'POLICIES' ? <Business fontSize="small" /> : <Description fontSize="small" />);
                  const time = new Date(doc.createdAt).toLocaleDateString();
                  
                  return (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <Box sx={{ mt: 0.5, p: 1, borderRadius: '50%', backgroundColor: `var(--icon-bg-${color})`, color: `var(--icon-text-${color})`, display: 'flex' }}>
                        {icon}
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {doc.title} <Typography component="span" variant="caption" sx={{ color: 'var(--text-secondary)' }}>— {doc.department}</Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                          {doc.category} · Added {time} {doc.uploader ? `by ${doc.uploader.name.split(' ')[0]}` : ''}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }) : (
                  <Typography variant="body2" sx={{ color: 'var(--text-muted)', py: 2, textAlign: 'center' }}>No recent updates</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

