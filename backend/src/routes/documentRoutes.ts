import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { documentController } from '../controllers/documentController';

const router = Router();

// Ensure upload directory exists
const uploadsDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
      'application/json'
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and TXT files are accepted.'));
    }
  }
});

// GET /api/documents
router.get('/', (req, res) => documentController.getDocuments(req, res));

// GET /api/documents/:id
router.get('/:id', (req, res) => documentController.getDocumentById(req, res));

// POST /api/documents/upload
router.post('/upload', upload.single('file'), (req, res) => documentController.uploadDocument(req, res));

// POST /api/documents/:id/extract
router.post('/:id/extract', (req, res) => documentController.extractDocument(req, res));

// POST /api/documents/:id/confirm
router.post('/:id/confirm', (req, res) => documentController.confirmExtraction(req, res));

export default router;
