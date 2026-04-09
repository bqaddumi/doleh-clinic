import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getUploadStream, saveUploadedFiles } from '../services/dataService.js';

const getBaseUrl = (req) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : req.protocol;

  return `${protocol}://${req.get('host')}`;
};

export const uploadFiles = asyncHandler(async (req, res) => {
  if (!req.files?.length) {
    throw new ApiError(400, 'No files uploaded');
  }

  const baseUrl = getBaseUrl(req);
  const uploaded = await saveUploadedFiles(req.files, baseUrl);

  res.status(201).json({
    files: uploaded
  });
});

export const serveUpload = asyncHandler(async (req, res) => {
  const streamInfo = await getUploadStream(req.params.id);

  if (!streamInfo) {
    throw new ApiError(404, 'File not found');
  }

  if (streamInfo.contentType) {
    res.setHeader('Content-Type', streamInfo.contentType);
  }

  if (streamInfo.filename) {
    res.setHeader('Content-Disposition', `inline; filename="${streamInfo.filename}"`);
  }

  streamInfo.stream.on('error', () => {
    if (!res.headersSent) {
      res.status(404).json({ message: 'File not found' });
    } else {
      res.end();
    }
  });

  streamInfo.stream.pipe(res);
});
