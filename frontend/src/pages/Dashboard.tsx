import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Card, CardContent, Typography, Box, Divider, Button, LinearProgress, TextField
} from '@mui/material';
import { 
  Description, LibraryBooks, Article, Help, Group, CheckCircleOutline, UploadFile, Add, Search, Assessment
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/documents/stats/overview');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      }
    };
    fetchStats();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>
            Good morning, {userName} 👋
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            {currentDate} · Here's what's happening at CFNRo today
          </Typography>
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 350 } }}>
          <TextField
            fullWidth
            placeholder="Search all documents..."
            variant="outlined"
            size="medium"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'var(--text-secondary)' }} />,
              sx: { 
                borderRadius: 2, 
                backgroundColor: 'var(--input-bg)',
                '& fieldset': { borderColor: 'var(--input-border)' },
                '&:hover fieldset': { borderColor: 'var(--input-focus-border) !important' },
                '&.Mui-focused fieldset': { borderColor: 'var(--input-focus-border) !important' },
                color: 'var(--text-primary)'
              }
            }}
          />
        </Box>
      </Box>

      {/* Top Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Documents */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-teal)', color: 'var(--icon-text-teal)', mb: 2 }}>
                  <Description />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Total Documents</Typography>
                <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 1 }}>{stats.total}</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-teal)' }}>↑ All categories</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Total Views */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-blue)', color: 'var(--icon-text-blue)', mb: 2 }}>
                  <Assessment />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Total Views</Typography>
                <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 1 }}>124</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-teal)' }}>↑ +18 this week</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-amber)', color: 'var(--icon-text-amber)', mb: 2 }}>
                  <Group />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Active Users</Typography>
                <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 1 }}>8</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-amber)' }}>● Online now</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Reviews */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--icon-bg-red)', color: 'var(--icon-text-red)', mb: 2 }}>
                  <CheckCircleOutline />
                </Box>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>Pending Reviews</Typography>
                <Typography variant="h4" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 1 }}>3</Typography>
                <Typography variant="caption" sx={{ color: 'var(--icon-text-red)' }}>⚠ Needs attention</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<UploadFile />} onClick={() => navigate('/admin')} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1.5, borderRadius: 2, '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--text-primary)', background: 'var(--icon-bg-teal)' } }}>
            Upload Doc
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Add />} onClick={() => navigate('/admin')} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1.5, borderRadius: 2, '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--text-primary)', background: 'var(--icon-bg-teal)' } }}>
            Add FAQ
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Search />} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1.5, borderRadius: 2, '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--text-primary)', background: 'var(--icon-bg-teal)' } }}>
            Search Docs
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button fullWidth variant="outlined" startIcon={<Assessment />} sx={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)', py: 1.5, borderRadius: 2, '&:hover': { borderColor: 'var(--icon-text-teal)', color: 'var(--text-primary)', background: 'var(--icon-bg-teal)' } }}>
            View Report
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column: Latest Updates & Recently Viewed */}
        <Grid item xs={12} md={7}>
          {/* Latest Updates */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Latest Updates</Typography>
                <Typography variant="body2" sx={{ color: 'var(--icon-text-teal)', cursor: 'pointer' }}>View all</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { title: 'New SOP uploaded', desc: 'Test.pdf added to HR department', time: '2 hours ago · Admin', color: 'teal', icon: <Description fontSize="small" /> },
                  { title: 'FAQ updated', desc: '"How to Raise Complaint?" answer revised', time: 'Yesterday · Admin', color: 'amber', icon: <Help fontSize="small" /> },
                  { title: 'New user access', desc: '3 employees onboarded to portal', time: '2 days ago · IT Dept', color: 'blue', icon: <Group fontSize="small" /> },
                  { title: 'Policy review due', desc: 'Leave Policy expires in 7 days', time: 'Reminder · Compliance', color: 'red', icon: <CheckCircleOutline fontSize="small" /> },
                  { title: 'Document downloaded', desc: 'Test.pdf by Rahul S.', time: '3 days ago · HR Dept', color: 'blue', icon: <Assessment fontSize="small" /> }
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ mt: 0.5, p: 1, borderRadius: '50%', backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})`, display: 'flex' }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                        {item.title} <Typography component="span" variant="body2" sx={{ color: 'var(--text-secondary)' }}>— {item.desc}</Typography>
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{item.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Recently Viewed</Typography>
                <Typography variant="body2" sx={{ color: 'var(--icon-text-teal)', cursor: 'pointer' }}>See all</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { title: 'Test', desc: 'SOP · HR', tag: 'SOPs', color: 'teal', icon: <LibraryBooks fontSize="small" /> },
                  { title: 'How to Raise Complaint?', desc: 'FAQ · IT', tag: 'FAQs', color: 'red', icon: <Help fontSize="small" /> },
                  { title: 'Leave Policy 2026', desc: 'Policy · HR', tag: 'Policy', color: 'blue', icon: <Description fontSize="small" /> }
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 1.5, backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})`, display: 'flex' }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{item.desc}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1, backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})` }}>
                      {item.tag}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Docs by Category, Announcements, Department Activity */}
        <Grid item xs={12} md={5}>
          {/* Docs by Category */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontSize: '1rem', mb: 3 }}>Docs by Category</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[
                  { label: 'SOPs', count: stats.sops, color: 'var(--icon-text-teal)' },
                  { label: 'FAQs', count: stats.faqs, color: 'var(--icon-text-blue)' },
                  { label: 'Policies', count: stats.policies, color: 'var(--text-muted)' },
                  { label: 'Templates', count: stats.templates, color: 'var(--text-muted)' }
                ].map((item, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ color: item.color }}>{item.count} doc{item.count !== 1 ? 's' : ''}</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.total === 0 ? 0 : (item.count / Math.max(stats.total, 1)) * 100} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: 'var(--input-border)',
                        '& .MuiLinearProgress-bar': { backgroundColor: item.color }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Announcements</Typography>
                <Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1, backgroundColor: 'var(--icon-bg-amber)', color: 'var(--icon-text-amber)' }}>2 new</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { title: 'Q2 Policy Review', desc: 'All dept heads to submit updates by May 30', time: 'HR Team · 1 day ago', color: 'amber', icon: <Description fontSize="small" /> },
                  { title: 'Portal Maintenance', desc: 'Scheduled downtime Sunday 2-4 AM', time: 'IT Dept · 2 days ago', color: 'blue', icon: <Group fontSize="small" /> }
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ mt: 0.5, p: 1, borderRadius: '50%', backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})`, display: 'flex' }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem', mb: 0.5 }}>
                        {item.title} <Typography component="span" variant="body2" sx={{ color: 'var(--text-secondary)' }}>— {item.desc}</Typography>
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{item.time}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Department Activity */}
          <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontSize: '1rem' }}>Department Activity</Typography>
                <Typography variant="body2" sx={{ color: 'var(--icon-text-teal)', cursor: 'pointer' }}>Full report</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[
                  { name: 'Human Resources', code: 'HR', percent: 80, color: 'teal' },
                  { name: 'IT Department', code: 'IT', percent: 60, color: 'blue' },
                  { name: 'Finance', code: 'FIN', percent: 35, color: 'amber' }
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: 1.5, backgroundColor: `var(--icon-bg-${item.color})`, color: `var(--icon-text-${item.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.8rem' }}>
                        {item.code}
                      </Box>
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{item.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '40%' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.percent} 
                        sx={{ 
                          flexGrow: 1,
                          height: 4, 
                          borderRadius: 2,
                          backgroundColor: 'var(--input-border)',
                          '& .MuiLinearProgress-bar': { backgroundColor: `var(--icon-text-${item.color})` }
                        }} 
                      />
                      <Typography variant="body2" sx={{ color: `var(--icon-text-${item.color})`, width: 35, textAlign: 'right' }}>{item.percent}%</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

