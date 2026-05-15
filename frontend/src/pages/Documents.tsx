import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Button, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Grid, Card, CardContent
} from '@mui/material';
import { Download, Description, LibraryBooks, Article, Help, MenuBook, ArrowBack } from '@mui/icons-material';
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ 
          width: 56, height: 56, borderRadius: 3, mr: 3,
          backgroundColor: `var(--icon-bg-${config.color})`, color: `var(--icon-text-${config.color})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.cloneElement(config.icon as React.ReactElement, { fontSize: 'large' })}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'var(--text-primary)', mb: 0.5 }}>
            {getPageTitle()}
          </Typography>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
            {config.desc}
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="var(--text-secondary)">Loading documents...</Typography>
        </Box>
      ) : uniqueFilteredDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="var(--text-secondary)">No documents found in this category.</Typography>
        </Box>
      ) : category?.toUpperCase() === 'FAQS' ? (
        <Grid container spacing={3}>
          {uniqueFilteredDocuments.map((document) => (
            <Grid item xs={12} md={8} key={document.id}>
              <Card sx={{ background: 'var(--card-bg-white)', borderColor: 'var(--card-border)', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--text-primary)' }}>
                    Q: {document.question}
                  </Typography>
                  <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    A: {document.answer}
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
    </Container>
  );
};

export default Documents;
