import { Router, Request, Response } from 'express';
import { uploadSingle, uploadMultiple } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { ResponseHandler } from '../utils';
import { asyncHandler } from '../middleware/error';

const router = Router();

// Upload endpoint that matches frontend expectations: /api/v1/file/upload
router.post('/upload', uploadSingle, asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ResponseHandler.badRequest(res, 'No file uploaded');
  }

  const uploadType = req.headers['upload-type'];
  let folder = 'others';
  
  if (uploadType === 'book') {
    folder = 'book';
  } else if (uploadType === 'avatar') {
    folder = 'avatar';
  }

  // Frontend expects this exact response format
  const fileUrl = `/images/${folder}/${req.file.filename}`;
  
  ResponseHandler.success(res, 'Upload file thành công', {
    fileUploaded: fileUrl
  });
}));

// Legacy single upload (keeping for backward compatibility)
router.post('/single', authenticate, uploadSingle, asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return ResponseHandler.badRequest(res, 'No file uploaded');
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  
  ResponseHandler.success(res, 'File uploaded successfully', {
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    url: fileUrl
  });
}));

// Upload multiple images
router.post('/multiple', uploadMultiple, asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return ResponseHandler.badRequest(res, 'No files uploaded');
  }

  const files = req.files as Express.Multer.File[];
  const uploadedFiles = files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    url: `/uploads/${file.filename}`
  }));

  ResponseHandler.success(res, 'Files uploaded successfully', uploadedFiles);
}));

export default router;
