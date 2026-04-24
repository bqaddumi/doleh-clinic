import { Router } from 'express';
import multer from 'multer';
import { serveUpload, uploadFiles } from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5
  }
});

router.get('/:id', serveUpload);
router.post('/', protect, authorize('admin'), upload.array('files', 5), uploadFiles);

export default router;
