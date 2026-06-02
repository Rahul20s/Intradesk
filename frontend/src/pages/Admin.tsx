import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { CloudUpload, Delete, Edit } from '@mui/icons-material';
import api from '../services/api';

interface Document {
  id: string;
  title: string;
  category: string;
  department: string;
  uploadedDate: string;
  uploadedBy: string;
  fileName?: string;
  question?: string;
  answer?: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Policies': ['HR', 'IT', 'Company'],
  'SOPs': ['LMS', 'General'],
  'Forms & Templates': ['General'],
  'FAQs': ['General'],
  'Guidelines': ['General'],
  'Important Links': ['General']
};

const toBackendCategory = (frontendCat: string) => {
  if (frontendCat === 'Forms & Templates') return 'TEMPLATES';
  if (frontendCat === 'Important Links') return 'IMPORTANT_LINKS';
  return frontendCat.toUpperCase();
};

const toFrontendCategory = (backendCat: string) => {
  if (!backendCat) return '';
  const upper = backendCat.toUpperCase();
  if (upper === 'TEMPLATES') return 'Forms & Templates';
  if (upper === 'POLICIES') return 'Policies';
  if (upper === 'SOPS') return 'SOPs';
  if (upper === 'FAQS') return 'FAQs';
  if (upper === 'GUIDELINES') return 'Guidelines';
  if (upper === 'IMPORTANT_LINKS') return 'Important Links';
  return backendCat;
};

const Admin: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    department: '',
    file: null as File | null,
    question: '',
    answer: '',
    url: ''
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    department: '',
    question: '',
    answer: ''
  });

  const handleInputChange = (field: string) => (event: any) => {
    const value = event.target.value;
    if (field === 'category') {
      // Automatically reset department and set to 'General' if it's the only option
      const submenus = CATEGORY_MAP[value] || ['General'];
      setFormData({
        ...formData,
        category: value,
        department: submenus.length === 1 ? submenus[0] : ''
      });
    } else {
      setFormData({
        ...formData,
        [field]: value
      });
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents?limit=100');
        const data = response.data.data || [];
        const uniqueDocuments = data.filter((doc: any, index: number, self: any[]) =>
          index === self.findIndex((d: any) => d.id === doc.id)
        );
        setDocuments(uniqueDocuments);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFormData({ ...formData, file: event.target.files[0] });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading) return;
    
    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', toBackendCategory(formData.category));
      formDataToSend.append('department', formData.department);
      
      if (formData.category === 'FAQs') {
        formDataToSend.append('question', formData.question);
        formDataToSend.append('answer', formData.answer);
      } else if (formData.category === 'Important Links') {
        formDataToSend.append('url', formData.url);
      }
      
      if (formData.file && formData.category !== 'FAQs' && formData.category !== 'Important Links') {
        formDataToSend.append('file', formData.file);
      }

      const response = await api.post('/documents', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200 || response.status === 201) {
        alert('Document uploaded successfully!');
        setFormData({ title: '', category: '', department: '', file: null, question: '', answer: '', url: '' });
        const res = await api.get('/documents?limit=100');
        setDocuments(res.data.data || []);
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const response = await api.delete(`/documents/${id}`);
      if (response.status === 200 || response.status === 204) {
        alert('Document deleted successfully!');
        const res = await api.get('/documents?limit=100');
        setDocuments(res.data.data || []);
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document');
    }
  };

  const handleEdit = (doc: any) => {
    setEditing(doc.id);
    setEditFormData({
      title: doc.title,
      category: toFrontendCategory(doc.category),
      department: doc.department,
      question: doc.question || '',
      answer: doc.answer || ''
    });
  };

  const handleEditInputChange = (field: string) => (event: any) => {
    const value = event.target.value;
    if (field === 'category') {
      const submenus = CATEGORY_MAP[value] || ['General'];
      setEditFormData({
        ...editFormData,
        category: value,
        department: submenus.length === 1 ? submenus[0] : ''
      });
    } else {
      setEditFormData({
        ...editFormData,
        [field]: value
      });
    }
  };

  const handleEditSubmit = async (id: string) => {
    try {
      const dataToSend = {
        ...editFormData,
        category: toBackendCategory(editFormData.category)
      };
      const response = await api.put(`/documents/${id}`, dataToSend);
      if (response.status === 200) {
        alert('Document updated successfully!');
        setEditing(null);
        const res = await api.get('/documents?limit=100');
        setDocuments(res.data.data || []);
      } else {
        alert('Failed to update document');
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update document');
    }
  };

  const handleCancelEdit = () => {
    setEditing(null);
  };

  const availableSubmenus = formData.category ? CATEGORY_MAP[formData.category] || [] : [];
  const availableEditSubmenus = editFormData.category ? CATEGORY_MAP[editFormData.category] || [] : [];

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', gap: 3 }}>
      
      {/* Upload Form - Left Side (35%) */}
      <Card sx={{ flex: '0 0 35%', display: 'flex', flexDirection: 'column', borderRadius: 0, borderTop: '6px solid var(--accent-blue)', height: '100%' }}>
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid var(--card-border)', backgroundColor: '#fff' }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
            Upload New Document
          </Typography>
        </Box>
        <Box sx={{ p: 3, overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Document Title" value={formData.title} onChange={handleInputChange('title')}
              margin="normal" required size="small"
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { backgroundColor: 'var(--input-bg)' } }}
            />
            
            <FormControl fullWidth margin="normal" required size="small">
              <InputLabel>Menu (Category)</InputLabel>
              <Select value={formData.category} label="Menu (Category)" onChange={handleInputChange('category')} sx={{ mb: 2, backgroundColor: 'var(--input-bg)' }}>
                {Object.keys(CATEGORY_MAP).map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required size="small" disabled={!formData.category}>
              <InputLabel>Submenu (Department)</InputLabel>
              <Select value={formData.department} label="Submenu (Department)" onChange={handleInputChange('department')} sx={{ mb: 2, backgroundColor: 'var(--input-bg)' }}>
                {availableSubmenus.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {formData.category === 'FAQs' ? (
              <>
                <TextField fullWidth label="Question" value={formData.question} onChange={handleInputChange('question')} margin="normal" required multiline rows={3} size="small" sx={{ mb: 2, backgroundColor: 'var(--input-bg)' }} />
                <TextField fullWidth label="Answer" value={formData.answer} onChange={handleInputChange('answer')} margin="normal" required multiline rows={4} size="small" sx={{ mb: 2, backgroundColor: 'var(--input-bg)' }} />
              </>
            ) : formData.category === 'Important Links' ? (
              <TextField fullWidth label="Direct Download URL (SharePoint/OneDrive)" value={formData.url} onChange={handleInputChange('url')} margin="normal" required size="small" sx={{ mb: 2, backgroundColor: 'var(--input-bg)' }} />
            ) : (
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                component="label"
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  mt: 1, mb: 2, p: 3, border: '2px dashed', 
                  borderColor: isDragging ? 'var(--accent-blue)' : 'var(--input-border)',
                  backgroundColor: isDragging ? 'rgba(46, 108, 209, 0.05)' : 'var(--input-bg)',
                  borderRadius: 2, textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: 'var(--accent-blue)' }
                }}
              >
                <CloudUpload sx={{ fontSize: 32, color: isDragging ? 'var(--accent-blue)' : 'var(--text-muted)', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontWeight: 500, mb: 0.5 }}>
                  {isDragging ? 'Drop file here' : 'Drag & drop your file here'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                  or click to browse
                </Typography>
                <input type="file" hidden onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
              </Box>
            )}

            {formData.category !== 'FAQs' && formData.category !== 'Important Links' && formData.file && (
               <Alert severity="info" sx={{ mb: 2, py: 0, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>Selected: {formData.file.name}</Alert>
            )}

            <Button type="submit" variant="contained" fullWidth disabled={uploading || !formData.title || !formData.category || !formData.department || (formData.category === 'FAQs' ? (!formData.question || !formData.answer) : formData.category === 'Important Links' ? !formData.url : !formData.file)} sx={{ background: 'var(--btn-primary-bg)', color: '#fff', mt: 2 }}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Documents List - Right Side (65%) */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 0, borderTop: '6px solid var(--accent-green)', height: '100%' }}>
        <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid var(--card-border)', backgroundColor: '#fff' }}>
          <Typography variant="subtitle2" sx={{ color: 'var(--accent-green)', fontWeight: 600 }}>
            Existing Documents
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3, backgroundColor: 'var(--page-bg)' }}>
          {documents.map((doc) => (
            <Card key={doc.id} sx={{ mb: 2, border: '1px solid var(--card-border)', borderRadius: 1, boxShadow: 'none' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {editing === doc.id ? (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Edit Document</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <TextField fullWidth label="Title" value={editFormData.title} onChange={handleEditInputChange('title')} size="small" />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Menu</InputLabel>
                            <Select value={editFormData.category} label="Menu" onChange={handleEditInputChange('category')}>
                              {Object.keys(CATEGORY_MAP).map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="small" disabled={!editFormData.category}>
                            <InputLabel>Submenu</InputLabel>
                            <Select value={editFormData.department} label="Submenu" onChange={handleEditInputChange('department')}>
                              {availableEditSubmenus.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button variant="contained" onClick={() => handleEditSubmit(doc.id)} size="small" sx={{ background: 'var(--btn-primary-bg)' }}>Save</Button>
                        <Button variant="outlined" onClick={handleCancelEdit} size="small" color="inherit">Cancel</Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, lineHeight: 1.2 }}>{doc.title}</Typography>
                      <Box sx={{ mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={toFrontendCategory(doc.category)} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'rgba(46, 108, 209, 0.1)', color: '#2E6CD1', fontWeight: 600 }} />
                        <Chip label={doc.department} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                      </Box>
                      {doc.category === 'FAQS' && doc.question && doc.answer ? (
                        <Box sx={{ mb: 1, backgroundColor: '#f9f9f9', p: 1, borderRadius: 1 }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontSize: '0.8rem' }}><strong>Q:</strong> {doc.question}</Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}><strong>A:</strong> {doc.answer}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                          {doc.fileName || 'No file attached'}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Uploaded by {doc.uploadedBy} on {new Date(doc.uploadedDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton size="small" onClick={() => handleEdit(doc)} sx={{ color: 'var(--accent-blue)' }}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(doc.id)} sx={{ color: 'var(--delete-icon)' }}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
          {documents.length === 0 && (
            <Typography variant="body2" sx={{ textAlign: 'center', color: 'var(--text-muted)', mt: 4 }}>No documents found</Typography>
          )}
        </Box>
      </Card>
      
    </Box>
  );
};

export default Admin;
