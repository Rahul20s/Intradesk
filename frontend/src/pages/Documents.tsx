import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Button, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Divider
} from '@mui/material';
import { Download, Description, LibraryBooks, Article, Help, MenuBook, Close, QuestionAnswer } from '@mui/icons-material';
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
  const navigate = useNavigate();
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

  const getPageTitle = () => {
    let title = category ? `${category.charAt(0).toUpperCase()}${category.slice(1)}` : 'Documents';
    if (title === 'Templates') title = 'Forms & Templates';
    if (department) title = `${department.toUpperCase()} ${title}`;
    return title;
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', pt: 2, px: 3 }}>
      
      {/* Header Box */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <Box sx={{ 
          width: 56, height: 56, borderRadius: 3, mr: 3,
          backgroundColor: `var(--icon-bg-${config.color})`, color: `var(--icon-text-${config.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.cloneElement(config.icon as React.ReactElement, { fontSize: 'large' })}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 500, color: 'var(--text-primary)', mb: 0.5 }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
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
        ) : category?.toUpperCase() === 'FAQS' ? (
          <Grid container spacing={2}>
            {uniqueFilteredDocuments.map((document) => (
              <Grid item xs={12} md={6} lg={4} key={document.id}>
                <Card 
                  onClick={() => setSelectedFaq(document)}
                  sx={{ 
                    cursor: 'pointer',
                    background: 'var(--card-bg-white)', 
                    borderTop: '4px solid var(--accent-orange)', 
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
                    <QuestionAnswer sx={{ color: 'var(--accent-orange)', mt: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {document.question}
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
                <TableRow sx={{ background: 'var(--table-header-bg)' }}>
                  <TableCell sx={{ color: 'var(--table-header-text)', fontWeight: 600, borderBottom: `1px solid var(--card-border)` }}>Sr No.</TableCell>
                  <TableCell sx={{ color: 'var(--table-header-text)', fontWeight: 600, borderBottom: `1px solid var(--card-border)` }}>Title</TableCell>
                  <TableCell sx={{ color: 'var(--table-header-text)', fontWeight: 600, borderBottom: `1px solid var(--card-border)` }}>Department</TableCell>
                  <TableCell sx={{ color: 'var(--table-header-text)', fontWeight: 600, borderBottom: `1px solid var(--card-border)` }}>Uploaded On</TableCell>
                  <TableCell align="right" sx={{ color: 'var(--table-header-text)', fontWeight: 600, borderBottom: `1px solid var(--card-border)` }}>Action</TableCell>
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
                    <TableCell align="right" sx={{ borderBottom: `1px solid var(--card-border)` }}>
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
        PaperProps={{ sx: { borderRadius: 3, borderTop: '6px solid var(--accent-orange)' } }}
      >
        {selectedFaq && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Help sx={{ color: 'var(--accent-orange)', mt: 0.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {selectedFaq.question}
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
              <Button onClick={() => setSelectedFaq(null)} variant="outlined" sx={{ color: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' }}>
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
