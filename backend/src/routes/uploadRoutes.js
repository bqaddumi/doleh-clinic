import { Router } from 'express';
import multer from 'multer';
import { serveUpload, uploadFiles } from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

const allowedMimeTypes = new Set(['application/pdf']);

const isAllowedUpload = (file) => file.mimetype.startsWith('image/') || allowedMimeTypes.has(file.mimetype);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  fileFilter: (_req, file, callback) => {
    if (!isAllowedUpload(file)) {
      callback(new Error('Only image and PDF files are allowed'));
      return;
    }

    callback(null, true);
  }
});

router.get('/:id', serveUpload);
router.post('/', protect, authorize('admin'), upload.array('files', 5), uploadFiles);

export default router;
