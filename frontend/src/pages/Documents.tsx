import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Search, Download, Description, LibraryBooks, Article, Help } from '@mui/icons-material';
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
  const { category } = useParams<{ category: string }>();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Format date function
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Helper functions for category styling
  const getCategoryColor = (cat: string | undefined): string => {
    const colors: { [key: string]: string } = {
      'policies': '#3C3489',
      'sops': '#085041',
      'templates': '#633806',
      'faqs': '#791F1F',
      'default': '#26215C'
    };
    return colors[cat?.toLowerCase() || 'default'] || colors.default;
  };



  const getCategoryIcon = (cat: string | undefined) => {
    const icons: { [key: string]: React.ReactNode } = {
      'policies': <Description sx={{ fontSize: 32, color: '#3C3489' }} />,
      'sops': <LibraryBooks sx={{ fontSize: 32, color: '#085041' }} />,
      'templates': <Article sx={{ fontSize: 32, color: '#633806' }} />,
      'faqs': <Help sx={{ fontSize: 32, color: '#791F1F' }} />,
      'default': <Description sx={{ fontSize: 32, color: '#26215C' }} />
    };
    return icons[cat?.toLowerCase() || 'default'] || icons.default;
  };

  const getCategoryDescription = (cat: string | undefined): string => {
    const descriptions: { [key: string]: string } = {
      'policies': 'Browse and download company policies and guidelines',
      'sops': 'Access standard operating procedures and workflows',
      'templates': 'Download document templates and forms',
      'faqs': 'Find answers to frequently asked questions',
      'default': 'Browse and download documents'
    };
    return descriptions[cat?.toLowerCase() || 'default'] || descriptions.default;
  };

  const departments = ['IT', 'HR', 'Accounts', 'Finance', 'Operations', 'Legal'];

  // Fetch real documents from API with server-side filtering
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedDepartment) params.append('department', selectedDepartment);
        // Note: Adding a short debounce here in a real app would be good
        
        const response = await api.get(`/documents/category/${category}?${params.toString()}`);
        // Backend now returns { data: [...], meta: {...} }
        setDocuments(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    // Use a small delay for search debouncing
    const delayDebounceFn = setTimeout(() => {
      fetchDocuments();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [category, searchTerm, selectedDepartment]);

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

  const handleView = async (doc: any) => {
    if (doc.category === 'FAQS') {
      // For FAQs, show Q&A in a modal or alert
      alert(`Question: ${doc.question}\n\nAnswer: ${doc.answer}`);
    } else {
      try {
        const response = await api.get(`/documents/${doc.id}/view`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] as string }));
        window.open(url, '_blank');
        // Note: we can't easily revoke the URL if it's in a new tab immediately
      } catch (error) {
        console.error('Error viewing document:', error);
        alert('Failed to view document');
      }
    }
  };

  const handleDownload = async (doc: any) => {
    if (doc.category === 'FAQS') {
      // For FAQs, create a text file with Q&A
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
        
        // Extract filename from content-disposition header if available
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, background: 'var(--page-bg)' }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          position: 'relative'
        }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 3, 
            mr: 3,
            background: 'var(--ice-blue)',
            boxShadow: `0 8px 24px ${getCategoryColor(category)}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getCategoryIcon(category)}
          </Box>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontSize: '2.2rem',
                lineHeight: 1.2,
                mb: 1
              }}
            >
              {category ? `${category.charAt(0).toUpperCase()}${category.slice(1)} Documents` : 'Documents'}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'var(--text-secondary)',
                fontSize: '1.1rem',
                fontWeight: 400
              }}
            >
              {getCategoryDescription(category)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          height: 3, 
          borderRadius: 2, 
          background: 'var(--ice-blue)',
          width: '100%',
          maxWidth: 200
        }} />
      </Box>

      {/* Search and Filter Section - Only show for non-FAQs */}
      {category !== 'faqs' && (
        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search documents..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading documents...
          </Typography>
        </Box>
      ) : uniqueFilteredDocuments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No documents found matching your criteria.
          </Typography>
        </Box>
      ) : category?.toUpperCase() === 'FAQS' ? (
        // FAQs display in Q&A card format
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {uniqueFilteredDocuments.map((document) => (
            <Grid item xs={12} md={8} key={document.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ p: 3, bgcolor: '#EEEDFE', borderRadius: 2, minHeight: 120 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#534AB7' }}>
                      Q: {document.question}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: '#26215C' }}>
                      A: {document.answer}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Regular documents display in table format
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            borderRadius: 3,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: 'none',
            overflow: 'hidden'
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ 
                background: '#EEEDFE',
                '&:hover': { backgroundColor: '#F5F4FF' },
                '&:nth-of-type(even)': {
                  backgroundColor: '#FAFAF8'
                }
              }}>
                <TableCell sx={{ 
                  color: '#534AB7', 
                  fontWeight: 'bold', 
                  width: '10%', 
                  py: 2,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px'
                }}>Sr No.</TableCell>
                <TableCell sx={{ 
                  color: '#534AB7', 
                  fontWeight: 'bold', 
                  width: '50%', 
                  py: 2,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px'
                }}>Title</TableCell>
                <TableCell sx={{ 
                  color: '#534AB7', 
                  fontWeight: 'bold', 
                  width: '20%', 
                  py: 2,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px'
                }}>Uploaded On</TableCell>
                <TableCell sx={{ 
                  color: '#534AB7', 
                  fontWeight: 'bold', 
                  width: '20%', 
                  py: 2,
                  fontSize: '0.95rem',
                  letterSpacing: '0.5px'
                }}>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueFilteredDocuments.map((document, index) => (
                <TableRow 
                  key={document.id} 
                  sx={{ 
                    '&:hover': { 
                      bgcolor: '#F5F4FF',
                      transition: 'background-color 0.3s ease'
                    },
                    '&:nth-of-type(even)': {
                      bgcolor: '#FAFAF8',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <TableCell sx={{ 
                    width: '10%',
                    py: 2,
                    fontWeight: 500,
                    color: '#26215C'
                  }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ width: '50%', py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#26215C',
                        fontSize: '0.95rem'
                      }}
                    >
                      {document.title}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%', py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#26215C',
                        fontSize: '0.9rem'
                      }}
                    >
                      {formatDate(document.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '20%', py: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Download />}
                      onClick={() => handleDownload(document)}
                      sx={{
                        background: 'var(--btn-action-bg)',
                        color: 'var(--btn-action-text)',
                        fontWeight: 600,
                        py: 1,
                        px: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px var(--btn-action-bg)30',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'var(--btn-action-hover)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px var(--btn-action-bg)40',
                        }
                      }}
                    >
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
