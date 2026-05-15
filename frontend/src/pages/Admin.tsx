import React, { useState, useEffect } from 'react';
import {
  Container,
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

const Admin: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    department: '',
    file: null as File | null,
    question: '',
    answer: ''
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    department: '',
    question: '',
    answer: ''
  });

  const categories = ['Policies', 'SOPs', 'Templates', 'FAQs'];
  const departments = ['IT', 'HR', 'Accounts', 'Finance', 'Operations', 'Legal'];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  // Fetch real documents from API
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get('/documents');
        const data = response.data.data || [];
        // Remove duplicates by ID
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
      setFormData({
        ...formData,
        file: event.target.files[0]
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (uploading) return; // Prevent double submission
    
    try {
      setUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('department', formData.department);
      
      if (formData.category === 'FAQs') {
        formDataToSend.append('question', formData.question);
        formDataToSend.append('answer', formData.answer);
      }
      
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const response = await api.post('/documents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        alert('Document uploaded successfully!');
        setFormData({
          title: '',
          category: '',
          department: '',
          file: null,
          question: '',
          answer: ''
        });
        // Re-fetch documents from API to avoid duplicates
        const fetchDocuments = async () => {
          const res = await api.get('/documents');
          setDocuments(res.data.data || []);
        };
        fetchDocuments();
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
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await api.delete(`/documents/${id}`);

      if (response.status === 200 || response.status === 204) {
        alert('Document deleted successfully!');
        // Re-fetch documents from API
        const fetchDocuments = async () => {
          const res = await api.get('/documents');
          setDocuments(res.data.data || []);
        };
        fetchDocuments();
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
      category: doc.category,
      department: doc.department,
      question: doc.question || '',
      answer: doc.answer || ''
    });
  };

  const handleEditInputChange = (field: string) => (event: any) => {
    setEditFormData({
      ...editFormData,
      [field]: event.target.value
    });
  };

  const handleEditSubmit = async (id: string) => {
    try {
      const response = await api.put(`/documents/${id}`, editFormData);

      if (response.status === 200) {
        alert('Document updated successfully!');
        setEditing(null);
        // Re-fetch documents from API
        const fetchDocuments = async () => {
          const res = await api.get('/documents');
          setDocuments(res.data.data || []);
        };
        fetchDocuments();
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
    setEditFormData({
      title: '',
      category: '',
      department: '',
      question: '',
      answer: ''
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, background: 'var(--page-bg)' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel - Document Management
      </Typography>

      <Grid container spacing={4}>
        {/* Upload Form */}
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'var(--card-bg-white)', border: '0.5px solid var(--card-border)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'var(--header-color)' }}>
                Upload New Document
              </Typography>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Document Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  margin="normal"
                  required
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--input-bg)',
                      borderRadius: 2,
                      borderColor: 'var(--input-border)',
                      '&:hover': {
                        borderColor: 'var(--input-focus-border)',
                      },
                      '&.Mui-focused': {
                        borderColor: 'var(--input-focus-border)',
                        boxShadow: 'var(--input-focus-shadow)',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'var(--placeholder)',
                      }
                    }
                  }}
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={handleInputChange('category')}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--input-bg)',
                        borderRadius: 2,
                        borderColor: 'var(--input-border)',
                        '&:hover': {
                          borderColor: 'var(--input-focus-border)',
                        },
                        '&.Mui-focused': {
                          borderColor: 'var(--input-focus-border)',
                          boxShadow: 'var(--input-focus-shadow)',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'var(--placeholder)',
                        }
                      }
                    }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.department}
                    label="Department"
                    onChange={handleInputChange('department')}
                    sx={{ 
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'var(--input-bg)',
                        borderRadius: 2,
                        borderColor: 'var(--input-border)',
                        '&:hover': {
                          borderColor: 'var(--input-focus-border)',
                        },
                        '&.Mui-focused': {
                          borderColor: 'var(--input-focus-border)',
                          boxShadow: 'var(--input-focus-shadow)',
                        },
                        '& .MuiInputBase-input::placeholder': {
                          color: 'var(--placeholder)',
                        }
                      }
                    }}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {formData.category === 'FAQs' ? (
                  <>
                    <TextField
                      fullWidth
                      label="Question"
                      value={formData.question}
                      onChange={handleInputChange('question')}
                      margin="normal"
                      required
                      multiline
                      rows={3}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--input-bg)',
                          borderRadius: 2,
                          borderColor: 'var(--input-border)',
                          '&:hover': {
                            borderColor: 'var(--input-focus-border)',
                          },
                          '&.Mui-focused': {
                            borderColor: 'var(--input-focus-border)',
                            boxShadow: 'var(--input-focus-shadow)',
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'var(--placeholder)',
                          }
                        }
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Answer"
                      value={formData.answer}
                      onChange={handleInputChange('answer')}
                      margin="normal"
                      required
                      multiline
                      rows={4}
                      sx={{ 
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'var(--input-bg)',
                          borderRadius: 2,
                          borderColor: 'var(--input-border)',
                          '&:hover': {
                            borderColor: 'var(--input-focus-border)',
                          },
                          '&.Mui-focused': {
                            borderColor: 'var(--input-focus-border)',
                            boxShadow: 'var(--input-focus-shadow)',
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'var(--placeholder)',
                          }
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      component="label"
                      fullWidth
                      sx={{ mt: 2, mb: 2, background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                      startIcon={<CloudUpload />}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                      />
                    </Button>
                    
                    {formData.file && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Selected: {formData.file.name}
                      </Alert>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={uploading || !formData.title || !formData.category || !formData.department || 
                    (formData.category === 'FAQs' ? (!formData.question || !formData.answer) : !formData.file)}
                  sx={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents List */}
        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: 'var(--card-bg-white)', border: '0.5px solid var(--card-border)', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'var(--header-color)' }}>
                Existing Documents
              </Typography>
              
              {documents.map((doc) => (
                <Card key={doc.id} sx={{ mb: 2, backgroundColor: 'var(--card-bg-white)', border: 'none', borderRadius: 3 }}>
                  <CardContent>
                    {editing === doc.id ? (
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: 'var(--header-color)' }}>
                          Edit Document
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <TextField
                            fullWidth
                            label="Document Title"
                            value={editFormData.title}
                            onChange={handleEditInputChange('title')}
                            size="small"
                            sx={{ 
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'var(--input-bg)',
                                borderRadius: 2,
                                borderColor: 'var(--input-border)',
                                '&:hover': {
                                  borderColor: 'var(--input-focus-border)',
                                },
                                '&.Mui-focused': {
                                  borderColor: 'var(--input-focus-border)',
                                  boxShadow: 'var(--input-focus-shadow)',
                                },
                                '& .MuiInputBase-input::placeholder': {
                                  color: 'var(--placeholder)',
                                }
                              }
                            }}
                          />
                          <FormControl fullWidth size="small">
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={editFormData.category}
                              label="Category"
                              onChange={handleEditInputChange('category')}
                              sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'var(--input-bg)',
                                  borderRadius: 2,
                                  borderColor: 'var(--input-border)',
                                  '&:hover': {
                                    borderColor: 'var(--input-focus-border)',
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'var(--input-focus-border)',
                                    boxShadow: 'var(--input-focus-shadow)',
                                  },
                                  '& .MuiInputBase-input::placeholder': {
                                    color: 'var(--placeholder)',
                                  }
                                }
                              }}
                            >
                              {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                  {cat}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl fullWidth size="small">
                            <InputLabel>Department</InputLabel>
                            <Select
                              value={editFormData.department}
                              label="Department"
                              onChange={handleEditInputChange('department')}
                              sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'var(--input-bg)',
                                  borderRadius: 2,
                                  borderColor: 'var(--input-border)',
                                  '&:hover': {
                                    borderColor: 'var(--input-focus-border)',
                                  },
                                  '&.Mui-focused': {
                                    borderColor: 'var(--input-focus-border)',
                                    boxShadow: 'var(--input-focus-shadow)',
                                  },
                                  '& .MuiInputBase-input::placeholder': {
                                    color: 'var(--placeholder)',
                                  }
                                }
                              }}
                            >
                              {departments.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                  {dept}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              onClick={() => handleEditSubmit(doc.id)}
                              size="small"
                              sx={{ background: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={handleCancelEdit}
                              size="small"
                              sx={{ background: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {doc.title}
                          </Typography>
                          <Box sx={{ mb: 1 }}>
                            <Chip 
                              label={doc.category} 
                              size="small" 
                              color="primary" 
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              label={doc.department} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                          {doc.category === 'FAQS' && doc.question && doc.answer ? (
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                <strong>Q:</strong> {doc.question}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>A:</strong> {doc.answer}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {doc.fileName || 'No file'}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Uploaded by {doc.uploadedBy} on {doc.uploadedDate}
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton size="small" color="primary" onClick={() => handleEdit(doc)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(doc.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Admin;
