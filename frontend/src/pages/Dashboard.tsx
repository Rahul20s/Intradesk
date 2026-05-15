import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid, Card, Typography, Box, Divider, Avatar, IconButton, LinearProgress
} from '@mui/material';
import { 
  Description, Business, FileCopy, AddCircle, Search, Help, Assessment, Star
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total: 0, policies: 0, sops: 0, templates: 0, faqs: 0 });
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

  const departmentStats = useMemo(() => {
    if (recentDocs.length === 0) return [];
    const counts: Record<string, number> = {};
    recentDocs.forEach(doc => { counts[doc.department] = (counts[doc.department] || 0) + 1; });
    const total = recentDocs.length;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.percent - a.percent).slice(0, 4);
  }, [recentDocs]);

  const latestUpdates = recentDocs.slice(0, 4);
  const recentDownloads = recentDocs.slice(4, 8); // Displaying recent from array

  return (
    <Box sx={{ mt: 0, mb: 4 }}>
      <Grid container spacing={3}>
        
        {/* ROW 1: Banner + Stats + Updates */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 340, backgroundImage: 'url(/banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 0, position: 'relative' }}>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 300 }}>Company Portal</Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>Streamlining internal knowledge.</Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            {/* Stat Card 1 */}
            <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-yellow)', display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <FileCopy sx={{ fontSize: 40, color: 'var(--accent-yellow)', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Total Documents</Typography>
                </Box>
              </Box>
            </Card>
            {/* Stat Card 2 */}
            <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-blue)', display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <Business sx={{ fontSize: 40, color: 'var(--accent-blue)', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.policies}</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Company Policies</Typography>
                </Box>
              </Box>
            </Card>
            {/* Stat Card 3 */}
            <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-orange)', display: 'flex', alignItems: 'center', p: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <Description sx={{ fontSize: 40, color: 'var(--accent-orange)', mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.sops}</Typography>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>SOPs Available</Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: 340, borderRadius: 0 }}>
            <Box sx={{ backgroundColor: 'var(--accent-cyan)', p: 1.5, textAlign: 'center', color: '#fff' }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Description sx={{ fontSize: 18, mr: 1 }} /> Updates</Typography>
            </Box>
            <ListContent items={latestUpdates} emptyText="No updates" showAvatar={true} />
          </Card>
        </Grid>

        {/* ROW 2: 4 Columns */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: 400, borderRadius: 0, borderTop: '6px solid var(--accent-orange)' }}>
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
              <Typography variant="subtitle2" sx={{ color: 'var(--accent-orange)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 Department Focus
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {departmentStats.length > 0 ? departmentStats.map((dept, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 0.5, color: 'var(--text-secondary)' }}>{dept.name}</Typography>
                  <LinearProgress variant="determinate" value={dept.percent} sx={{ height: 6, borderRadius: 3, backgroundColor: '#f0f0f0', '& .MuiLinearProgress-bar': { backgroundColor: 'var(--accent-orange)' } }} />
                  <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>{dept.percent}% of recent activity</Typography>
                </Box>
              )) : (
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', mt: 4 }}>No data available</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: 400, borderRadius: 0, borderTop: '6px solid var(--accent-blue)' }}>
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
              <Typography variant="subtitle2" sx={{ color: 'var(--accent-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 Docs by Category
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              {[
                { label: 'SOPs', count: stats.sops },
                { label: 'FAQs', count: stats.faqs },
                { label: 'Policies', count: stats.policies },
                { label: 'Templates', count: stats.templates }
              ].map((cat, i) => (
                <Box key={i} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{cat.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.count}</Typography>
                  </Box>
                  <Divider />
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: 400, borderRadius: 0, borderTop: '6px solid var(--accent-green)' }}>
            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
              <Typography variant="subtitle2" sx={{ color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 Recent Documents
              </Typography>
            </Box>
            <ListContent items={recentDownloads} emptyText="No recent docs" showAvatar={false} />
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: 400, borderRadius: 0, borderTop: '6px solid var(--accent-pink)' }}>
            <Box sx={{ backgroundColor: 'var(--accent-pink)', p: 1.5, textAlign: 'center', color: '#fff' }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Star sx={{ fontSize: 18, mr: 1 }} /> Favourite</Typography>
            </Box>
            <Box sx={{ p: 3, mt: 2 }}>
              <Grid container spacing={4}>
                <QuickAction icon={<Business sx={{ color: '#2E6CD1' }} />} label="Admin" onClick={() => navigate('/admin')} />
                <QuickAction icon={<Description sx={{ color: '#F48B29' }} />} label="Docs" onClick={() => navigate('/documents/default')} />
                <QuickAction icon={<AddCircle sx={{ color: '#5CC665' }} />} label="Add" onClick={() => navigate('/admin')} />
                <QuickAction icon={<Search sx={{ color: '#EA45A2' }} />} label="Search" onClick={() => navigate('/documents/default')} />
                <QuickAction icon={<Help sx={{ color: '#7B3ED6' }} />} label="FAQs" onClick={() => navigate('/documents/faqs')} />
                <QuickAction icon={<Assessment sx={{ color: '#FCE300' }} />} label="Report" onClick={() => {}} />
              </Grid>
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

const ListContent: React.FC<{ items: any[], emptyText: string, showAvatar: boolean }> = ({ items, emptyText, showAvatar }) => {
  if (items.length === 0) return <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', mt: 4 }}>{emptyText}</Typography>;
  
  return (
    <Box sx={{ p: 0 }}>
      {items.map((doc, i) => (
        <Box key={i} sx={{ p: 2, borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {showAvatar ? (
            <Avatar sx={{ bgcolor: 'var(--accent-orange)', width: 32, height: 32, fontSize: '0.85rem' }}>{doc.title.charAt(0)}</Avatar>
          ) : (
            <Description sx={{ color: 'var(--accent-green)', mt: 0.5 }} />
          )}
          <Box>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.2, mb: 0.5 }}>
              {doc.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
              {doc.department} · {new Date(doc.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={onClick}>
    <IconButton sx={{ backgroundColor: '#f9f9f9', mb: 1, width: 48, height: 48 }}>
      {icon}
    </IconButton>
    <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>{label}</Typography>
  </Grid>
);

export default Dashboard;
