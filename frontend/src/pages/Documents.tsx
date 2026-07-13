import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Button, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import { Download, Description, LibraryBooks, Article, Help, MenuBook, Close, QuestionAnswer, Visibility, Campaign } from '@mui/icons-material';
import api from '../services/api';

interface Document {
  id: string;
  title: string;
  category: string;
  department: string;
  createdAt: string;
  fileSize?: string;
  fileName?: string;
  question?: string;
  answer?: string;
}

const Documents: React.FC = () => {
  const { category, department } = useParams<{ category: string, department?: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFaq, setSelectedFaq] = useState<Document | null>(null);

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryConfig = (cat: string | undefined) => {
    const configs: { [key: string]: { icon: React.ReactNode, color: string, desc: string } } = {
      'policies': { icon: <Description />, color: 'blue', desc: 'Browse and download company policies' },
      'sops': { icon: <LibraryBooks />, color: 'teal', desc: 'Access standard operating procedures' },
      'templates': { icon: <Article />, color: 'amber', desc: 'Download document forms and templates' },
      'faqs': { icon: <Help />, color: 'red', desc: 'Find answers to frequently asked questions' },
      'guidelines': { icon: <MenuBook />, color: 'purple', desc: 'Review company guidelines and principles' },
      'announcements': { icon: <Campaign />, color: 'cyan', desc: 'Read the latest company announcements' },
      'default': { icon: <Description />, color: 'teal', desc: 'Browse and download documents' }
    };
    return configs[cat?.toLowerCase() || 'default'] || configs.default;
  };

  const config = getCategoryConfig(category);

  // Fetch real documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (department) params.append('department', department);
        
        const response = await api.get(`/documents/category/${category}?${params.toString()}`);
        setDocuments(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [category, department]);

  const uniqueFilteredDocuments = React.useMemo(() => {
    const seen = new Set();
    return documents.filter(doc => {
      if (seen.has(doc.id)) {
        return false;
      }
      seen.add(doc.id);
      return true;
    });
  }, [documents]);

  const handleDownload = async (doc: any) => {
    if (doc.category === 'FAQS') {
      const content = `Question: ${doc.question}\n\nAnswer: ${doc.answer}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      try {
        const response = await api.get(`/documents/${doc.id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        let filename = doc.fileName || 'document';
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '');
            }
        }
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading document:', error);
        alert('Failed to download document');
      }
    }
  };

  const handleView = async (doc: any) => {
    if (doc.category === 'IMPORTANT_LINKS') {
      window.open(doc.filePath, '_blank');
      return;
    }
    
    try {
      const response = await api.get(`/documents/${doc.id}/view`, { responseType: 'blob' });
      const type = (response.headers['content-type'] as string) || 'application/pdf';
      const blob = new Blob([response.data], { type });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Cleanup the URL object after the new tab has had time to load it
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to view document');
    }
  };

  const getPageTitle = () => {
    let catTitle = '';
    if (!category || category === 'default') {
      catTitle = 'Documents';
    } else {
      const lowerCat = category.toLowerCase();
      if (lowerCat === 'sops') catTitle = "SOPs";
      else if (lowerCat === 'faqs') catTitle = "FAQs";
      else if (lowerCat === 'templates') catTitle = 'Forms & Templates';
      else if (lowerCat === 'announcements') catTitle = 'Announcements';
      else catTitle = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }
    
    let depTitle = '';
    if (department) {
       if (department.toUpperCase() === 'HR' || department.toUpperCase() === 'IT' || department.toUpperCase() === 'LMS') {
           depTitle = department.toUpperCase();
       } else {
           depTitle = department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
       }
    }

    if (depTitle) {
      return `${depTitle} ${catTitle}`;
    }
    return catTitle;
  };

  return (
    <Box sx={{ height: { xs: 'auto', md: 'calc(100vh - 100px)' }, display: 'flex', flexDirection: 'column', overflow: { xs: 'visible', md: 'hidden' }, pt: 2, px: { xs: 2, md: 3 } }}>
      
      {/* Header Box */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Box sx={{ 
          width: 48, height: 48, borderRadius: 2, mr: 2,
          backgroundColor: `var(--icon-bg-${config.color})`, color: `var(--icon-text-${config.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.cloneElement(config.icon as React.ReactElement, { fontSize: 'medium' })}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 0.25 }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            {config.desc}
          </Typography>
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 4, pr: 1 }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="var(--text-secondary)">Loading documents...</Typography>
          </Box>
        ) : uniqueFilteredDocuments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="var(--text-secondary)">No documents found in this category.</Typography>
          </Box>
        ) : (category?.toUpperCase() === 'FAQS' || category?.toUpperCase() === 'ANNOUNCEMENTS') ? (
          <Grid container spacing={2}>
            {uniqueFilteredDocuments.map((document) => (
              <Grid item xs={12} md={6} lg={4} key={document.id}>
                <Card 
                  onClick={() => setSelectedFaq(document)}
                  sx={{ 
                    cursor: 'pointer',
                    background: 'var(--card-bg-white)', 
                    borderTop: '4px solid #212a34', 
                    borderBottom: '1px solid var(--card-border)',
                    borderLeft: '1px solid var(--card-border)',
                    borderRight: '1px solid var(--card-border)',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, pb: '16px !important', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {category?.toUpperCase() === 'FAQS' ? <QuestionAnswer sx={{ color: '#212a34', mt: 0.5 }} /> : <Campaign sx={{ color: '#212a34', mt: 0.5 }} />}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {document.title || document.question}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, background: 'var(--card-bg-white)', border: `1px solid var(--card-border)`, boxShadow: 'none' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: 'none' }}>Sr No.</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: 'none' }}>Title</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: 'none' }}>Department</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600, borderBottom: 'none' }}>Uploaded On</TableCell>
                  <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 600, borderBottom: 'none' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uniqueFilteredDocuments.map((document, index) => (
                  <TableRow key={document.id} sx={{ '&:hover': { bgcolor: 'var(--table-row-hover)' } }}>
                    <TableCell sx={{ color: 'var(--text-primary)', borderBottom: `1px solid var(--card-border)` }}>{index + 1}</TableCell>
                    <TableCell sx={{ borderBottom: `1px solid var(--card-border)` }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {document.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid var(--card-border)` }}>
                      <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1, backgroundColor: 'var(--icon-bg-blue)', color: 'var(--icon-text-blue)' }}>
                        {document.department}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'var(--text-secondary)', borderBottom: `1px solid var(--card-border)` }}>{formatDate(document.createdAt)}</TableCell>
                    <TableCell align="center" sx={{ borderBottom: `1px solid var(--card-border)`, whiteSpace: 'nowrap' }}>
                      <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={() => handleView(document)}
                        sx={{
                          color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)', mr: 1,
                          '&:hover': { background: 'rgba(46, 108, 209, 0.05)', borderColor: 'var(--accent-blue)' }, boxShadow: 'none'
                        }}>
                        View
                      </Button>
                      <Button size="small" variant="contained" startIcon={<Download />} onClick={() => handleDownload(document)}
                        sx={{
                          background: 'var(--btn-action-bg)', color: 'var(--btn-action-text)',
                          '&:hover': { background: 'var(--btn-action-hover)' }, boxShadow: 'none'
                        }}>
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* FAQ Modal Popup */}
      <Dialog 
        open={Boolean(selectedFaq)} 
        onClose={() => setSelectedFaq(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, borderTop: '6px solid #212a34' } }}
      >
        {selectedFaq && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                {category?.toUpperCase() === 'FAQS' ? <Help sx={{ color: '#212a34', mt: 0.5 }} /> : <Campaign sx={{ color: '#212a34', mt: 0.5 }} />}
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selectedFaq.title || selectedFaq.question}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedFaq(null)} size="small" sx={{ ml: 2, mt: -0.5 }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 3, pb: 3, minHeight: 120 }}>
              <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                {selectedFaq.answer}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button onClick={() => setSelectedFaq(null)} variant="outlined" sx={{ color: '#212a34', borderColor: '#212a34' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Documents;
