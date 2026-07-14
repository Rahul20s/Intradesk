import express from 'express';
import { PrismaClient, Category } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { BlobServiceClient } from '@azure/storage-blob';

const router = express.Router();
const prisma = new PrismaClient();

// Simple in-memory cache for stats
let statsCache = { data: null as any, lastFetched: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to determine content type based on file extension
const getContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

// Azure Blob Storage Configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER || '');

// Ensure container exists on startup (optional but good practice)
containerClient.createIfNotExists().catch(console.error);

// Configure multer for memory storage (we upload to Azure inside the route)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX files are allowed.'));
    }
  }
});

// Get all documents with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { category, department, search, page = '1', limit = '50' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    
    const where: any = {};
    
    if (category) {
      where.category = (typeof category === 'string' ? category.toUpperCase() : category);
    }
    
    if (department) {
      where.department = department;
    }
    
    if (search) {
      where.title = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        include: {
          uploader: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      data: documents,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get documents by category with pagination
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { department, search, page = '1', limit = '50' } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);
    
    const where: any = {
      category: category.toUpperCase() as Category
    };
    
    if (department) {
      where.department = department;
    }
    
    if (search) {
      where.title = {
        contains: search as string,
        mode: 'insensitive'
      };
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        skip,
        take,
        include: {
          uploader: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.document.count({ where })
    ]);

    res.json({
      data: documents,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload a new document
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, category, department, question, answer, url } = req.body;
    const file = req.file;
    const isFAQ = category.toUpperCase() === 'FAQS';
    const isImportantLink = category.toUpperCase() === 'IMPORTANT_LINKS';
    const isAnnouncement = category.toUpperCase() === 'ANNOUNCEMENTS';

    if (!title || !category || !department) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, category, department' 
      });
    }

    if (isFAQ && (!question || !answer)) {
      return res.status(400).json({ 
        error: 'FAQs require both question and answer fields' 
      });
    }

    if (isImportantLink && !url) {
      return res.status(400).json({ 
        error: 'Important Links require a URL' 
      });
    }

    if (isAnnouncement && !answer) {
      return res.status(400).json({
        error: 'Announcements require content (answer field)'
      });
    }

    if (!isFAQ && !isImportantLink && !isAnnouncement && !file) {
      return res.status(400).json({ 
        error: 'Standard documents require a file upload' 
      });
    }

    let filePath: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    if (isImportantLink) {
      filePath = url;
      fileName = 'External Link';
    } else if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const blobName = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
      });
      filePath = blobName;
      fileName = file.originalname;
      fileSize = file.size;
      mimeType = file.mimetype;
    }

    const document = await prisma.document.create({
      data: {
        title,
        category: (category as string).toUpperCase() as Category,
        department,
        fileName: fileName,
        filePath,
        fileSize: fileSize,
        mimeType: mimeType,
        question: isFAQ ? question : null,
        answer: (isFAQ || isAnnouncement) ? answer : null
      }
    });

    // Invalidate stats cache
    statsCache = { data: null, lastFetched: 0 };

    res.status(201).json(document);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document', details: error });
  }
});

// View a document (inline display)
router.get('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document || !document.filePath) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(document.filePath);
    
    if (!(await blockBlobClient.exists())) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    res.setHeader('Content-Type', getContentType(document.fileName || ''));
    res.setHeader('Content-Disposition', `inline; filename="${document.fileName || 'document'}"`);
    
    if (downloadBlockBlobResponse.readableStreamBody) {
      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } else {
      res.status(500).json({ error: 'Failed to stream document' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to view document' });
  }
});

// Download a document
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document || !document.filePath) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const blockBlobClient = containerClient.getBlockBlobClient(document.filePath);
    
    if (!(await blockBlobClient.exists())) {
      return res.status(404).json({ error: 'File not found in storage' });
    }

    const downloadBlockBlobResponse = await blockBlobClient.download(0);
    res.setHeader('Content-Type', getContentType(document.fileName || ''));
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName || 'document'}"`);
    
    if (downloadBlockBlobResponse.readableStreamBody) {
      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } else {
      res.status(500).json({ error: 'Failed to stream document' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.filePath && document.category !== 'IMPORTANT_LINKS') {
      const blockBlobClient = containerClient.getBlockBlobClient(document.filePath);
      await blockBlobClient.deleteIfExists();
    }

    // Delete database record
    await prisma.document.delete({
      where: { id }
    });

    // Invalidate stats cache
    statsCache = { data: null, lastFetched: 0 };

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Update a document
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, department } = req.body;
    
    const document = await prisma.document.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        title,
        category: (category as string).toUpperCase() as Category,
        department
      }
    });

    // Invalidate stats cache
    statsCache = { data: null, lastFetched: 0 };

    res.json(updatedDocument);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Get document statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const now = Date.now();
    if (statsCache.data && (now - statsCache.lastFetched < CACHE_TTL)) {
      return res.json(statsCache.data);
    }

    const [
      totalDocuments,
      policiesCount,
      sopsCount,
      templatesCount,
      faqsCount
    ] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({ where: { category: 'POLICIES' } }),
      prisma.document.count({ where: { category: 'SOPS' } }),
      prisma.document.count({ where: { category: 'TEMPLATES' } }),
      prisma.document.count({ where: { category: 'FAQS' } })
    ]);

    const result = {
      total: totalDocuments,
      policies: policiesCount,
      sops: sopsCount,
      templates: templatesCount,
      faqs: faqsCount
    };
    
    statsCache = { data: result, lastFetched: now };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
