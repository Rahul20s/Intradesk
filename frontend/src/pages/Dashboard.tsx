import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Box, Divider, Avatar, IconButton, LinearProgress, Grid
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
    <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* ROW 1 (45% height) */}
      <Box sx={{ display: 'flex', gap: 2, flex: 4.5 }}>
        {/* Banner (50% width) */}
        <Card sx={{ flex: 2, backgroundImage: 'url(/banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 300 }}>Company Portal</Typography>
            <Typography variant="body2" sx={{ color: '#ccc' }}>Streamlining internal knowledge.</Typography>
          </Box>
        </Card>

        {/* Stats (25% width) */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Stat Card 1 */}
          <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-yellow)', display: 'flex', alignItems: 'center', p: 2 }}>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <FileCopy sx={{ fontSize: 32, color: 'var(--accent-yellow)', mr: 2 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.1 }}>{stats.total}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Total Documents</Typography>
              </Box>
            </Box>
          </Card>
          {/* Stat Card 2 */}
          <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-blue)', display: 'flex', alignItems: 'center', p: 2 }}>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <Business sx={{ fontSize: 32, color: 'var(--accent-blue)', mr: 2 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.1 }}>{stats.policies}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>Company Policies</Typography>
              </Box>
            </Box>
          </Card>
          {/* Stat Card 3 */}
          <Card sx={{ flex: 1, borderRadius: 0, borderLeft: '6px solid var(--accent-orange)', display: 'flex', alignItems: 'center', p: 2 }}>
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <Description sx={{ fontSize: 32, color: 'var(--accent-orange)', mr: 2 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.1 }}>{stats.sops}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>SOPs Available</Typography>
              </Box>
            </Box>
          </Card>
        </Box>

        {/* Updates (25% width) */}
        <Card sx={{ flex: 1, borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ backgroundColor: 'var(--accent-cyan)', p: 1, textAlign: 'center', color: '#fff' }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><Description sx={{ fontSize: 16, mr: 1 }} /> Updates</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <ListContent items={latestUpdates} emptyText="No updates" showAvatar={true} />
          </Box>
        </Card>
      </Box>

      {/* ROW 2 (55% height) */}
      <Box sx={{ display: 'flex', gap: 2, flex: 5.5 }}>
        
        {/* Department Focus */}
        <Card sx={{ flex: 1, borderRadius: 0, borderTop: '6px solid var(--accent-orange)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.5, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
            <Typography variant="subtitle2" sx={{ color: 'var(--accent-orange)', fontWeight: 600, fontSize: '0.85rem' }}>
               Department Focus
            </Typography>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
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

        {/* Docs by Category */}
        <Card sx={{ flex: 1, borderRadius: 0, borderTop: '6px solid var(--accent-blue)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.5, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
            <Typography variant="subtitle2" sx={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.85rem' }}>
               Docs by Category
            </Typography>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
            {[
              { label: 'SOPs', count: stats.sops },
              { label: 'FAQs', count: stats.faqs },
              { label: 'Policies', count: stats.policies },
              { label: 'Templates', count: stats.templates }
            ].map((cat, i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>{cat.label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.count}</Typography>
                </Box>
                <Divider />
              </Box>
            ))}
          </Box>
        </Card>

        {/* Recent Documents */}
        <Card sx={{ flex: 1, borderRadius: 0, borderTop: '6px solid var(--accent-green)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.5, textAlign: 'center', borderBottom: '1px solid var(--card-border)' }}>
            <Typography variant="subtitle2" sx={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.85rem' }}>
               Recent Documents
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <ListContent items={recentDownloads} emptyText="No recent docs" showAvatar={false} />
          </Box>
        </Card>

        {/* Favourite */}
        <Card sx={{ flex: 1, borderRadius: 0, borderTop: '6px solid var(--accent-pink)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ backgroundColor: 'var(--accent-pink)', p: 1, textAlign: 'center', color: '#fff' }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><Star sx={{ fontSize: 16, mr: 1 }} /> Favourite</Typography>
          </Box>
          <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
            <Grid container spacing={2}>
              <QuickAction icon={<Business sx={{ color: '#2E6CD1', fontSize: 24 }} />} label="Admin" onClick={() => navigate('/admin')} />
              <QuickAction icon={<Description sx={{ color: '#F48B29', fontSize: 24 }} />} label="Docs" onClick={() => navigate('/documents/default')} />
              <QuickAction icon={<AddCircle sx={{ color: '#5CC665', fontSize: 24 }} />} label="Add" onClick={() => navigate('/admin')} />
              <QuickAction icon={<Search sx={{ color: '#EA45A2', fontSize: 24 }} />} label="Search" onClick={() => navigate('/documents/default')} />
              <QuickAction icon={<Help sx={{ color: '#7B3ED6', fontSize: 24 }} />} label="FAQs" onClick={() => navigate('/documents/faqs')} />
              <QuickAction icon={<Assessment sx={{ color: '#FCE300', fontSize: 24 }} />} label="Report" onClick={() => {}} />
            </Grid>
          </Box>
        </Card>

      </Box>

    </Box>
  );
};

const ListContent: React.FC<{ items: any[], emptyText: string, showAvatar: boolean }> = ({ items, emptyText, showAvatar }) => {
  if (items.length === 0) return <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', mt: 4 }}>{emptyText}</Typography>;
  
  return (
    <Box sx={{ p: 0 }}>
      {items.map((doc, i) => (
        <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          {showAvatar ? (
            <Avatar sx={{ bgcolor: 'var(--accent-orange)', width: 28, height: 28, fontSize: '0.8rem' }}>{doc.title.charAt(0)}</Avatar>
          ) : (
            <Description sx={{ color: 'var(--accent-green)', mt: 0.5, fontSize: 18 }} />
          )}
          <Box>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.2, mb: 0.5, fontSize: '0.8rem' }}>
              {doc.title}
            </Typography>
            <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
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
    <IconButton sx={{ backgroundColor: '#f9f9f9', mb: 0.5, width: 40, height: 40 }}>
      {icon}
    </IconButton>
    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{label}</Typography>
  </Grid>
);

export default Dashboard;
