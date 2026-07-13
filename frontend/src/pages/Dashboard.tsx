import React, { useState, useEffect, useMemo } from 'react';

import { 
  Card, Typography, Box, Divider, Avatar, LinearProgress, Button
} from '@mui/material';
import { 
  Description, Business, FileCopy, Star, Campaign
} from '@mui/icons-material';
import api from '../services/api';

const Dashboard: React.FC = () => {

  const [stats, setStats] = useState({ total: 0, policies: 0, sops: 0, templates: 0, faqs: 0 });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [importantLinks, setImportantLinks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes, linksRes, announcementsRes] = await Promise.all([
          api.get('/documents/stats/overview'),
          api.get('/documents?limit=50'),
          api.get('/documents/category/IMPORTANT_LINKS'),
          api.get('/documents/category/ANNOUNCEMENTS')
        ]);
        setStats(statsRes.data);
        setRecentDocs(docsRes.data.data || []);
        setImportantLinks(linksRes.data.data || []);
        setAnnouncements(announcementsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (doc: any) => {
    if (doc.category === 'IMPORTANT_LINKS') {
      const url = doc.filePath;
      // create a temporary link to trigger download behaviour
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    try {
      const response = await api.get(`/documents/${doc.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
      alert('Failed to download document');
    }
  };

  const departmentStats = useMemo(() => {
    if (recentDocs.length === 0) return [];
    const counts: Record<string, number> = {};
    recentDocs.forEach(doc => { counts[doc.department] = (counts[doc.department] || 0) + 1; });
    const total = recentDocs.length;
    return Object.entries(counts)
      .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.percent - a.percent).slice(0, 4);
  }, [recentDocs]);

  const latestAnnouncements = announcements.slice(0, 4);
  const recentDownloads = recentDocs.slice(4, 8); // Displaying recent from array

  return (
    <Box sx={{ height: { xs: 'auto', md: 'calc(100vh - 100px)' }, overflow: { xs: 'auto', md: 'hidden' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
      
      {/* ROW 1 (45% height) */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flex: 4.5 }}>
        {/* Banner (50% width) */}
        <Card sx={{ flex: 2, minHeight: { xs: 200, md: 'auto' }, backgroundImage: 'url(/banner.png)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', p: 3, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
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

        {/* Announcements (25% width) */}
        <Card sx={{ flex: 1, borderRadius: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ backgroundColor: 'var(--accent-cyan)', p: 1, textAlign: 'center', color: '#fff' }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><Campaign sx={{ fontSize: 16, mr: 1 }} /> Announcements</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <ListContent items={latestAnnouncements} emptyText="No announcements" showAvatar={true} />
          </Box>
        </Card>
      </Box>

      {/* ROW 2 (55% height) */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, flex: 5.5 }}>
        
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

        {/* Important Links */}
        <Card sx={{ flex: 1, borderRadius: 0, borderTop: '6px solid var(--accent-pink)', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ backgroundColor: 'var(--accent-pink)', p: 1, textAlign: 'center', color: '#fff' }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}><Star sx={{ fontSize: 16, mr: 1 }} /> Important Links</Typography>
          </Box>
          <Box sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
            {importantLinks.length > 0 ? importantLinks.map((link, i) => (
              <Box key={i} sx={{ p: 1.5, borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, flex: 1, fontSize: '0.8rem' }}>{link.title}</Typography>
                <Button size="small" variant="contained" onClick={() => handleDownload(link)} sx={{ backgroundColor: 'var(--accent-pink)', color: '#fff', '&:hover': { backgroundColor: '#d12e84' }, minWidth: 'auto', p: '2px 8px', fontSize: '0.7rem', boxShadow: 'none' }}>
                  Download
                </Button>
              </Box>
            )) : (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', mt: 4 }}>No important links</Typography>
            )}
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



export default Dashboard;
